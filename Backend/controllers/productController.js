const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { embedText } = require('../services/ai/aiService');

const getProducts = async (req, res) => {
    try {
        const {
            keyword,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const query = {};

        // Keyword Search (Search in name, description, category)
        if (keyword && keyword.trim() !== '') {
            const searchRegex = new RegExp(keyword.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }

        // Category Filter
        if (category && category !== 'All' && category !== '') {
            query.category = category;
        }

        // Price Range Filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'rating') sortOption = { rating: -1 };
        else if (sort === 'reviews') sortOption = { numReviews: -1 };
        else if (sort === 'name_asc') sortOption = { name: 1 };

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const categories = await Product.distinct('category');

        res.json({
            success: true,
            products,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1,
            total,
            categories
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error fetching products', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product){
            res.json(product);
        } else {
            res.status(404).json({message: 'Product not found'});

        }
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
};

const createProduct = async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    let imageUrl = '';
    try {
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        // Generate embedding vector for semantic search
        let embedding = [];
        try {
            embedding = await embedText(`${name || ''} ${description || ''} ${category || ''}`);
        } catch (e) {
            console.warn('Embedding generation skipped:', e.message);
        }

        const product = new Product({ name, description, price, category, stock, imageUrl, embedding });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.log("CREATE PRODUCT ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete temp upload file:', err.message);
            });
        }
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.stock = stock || product.stock;

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path);
                product.imageUrl = result.secure_url;
            }

            // Refresh embedding
            try {
                product.embedding = await embedText(`${product.name} ${product.description} ${product.category}`);
            } catch (e) {
                console.warn('Embedding update skipped:', e.message);
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete temp upload file:', err.message);
            });
        }
    }
};

const deleteProduct =  async(req,res)=> {
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            await Product.deleteOne({ _id: req.params.id });
            res.json({message: 'Product deleted successfully'});
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error' ,error: error.message});

    }
};

// ================= REVIEWS =================

const checkPurchase = async (req, res) => {
    try {
        const productId = req.params.id;
        const order = await Order.findOne({ user: req.user.id, 'items.productId': productId });
        const purchased = !!order;
        return res.json({ purchased });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const addReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // ensure the user purchased the product
        const order = await Order.findOne({ user: req.user.id, 'items.productId': productId });
        if (!order) return res.status(403).json({ message: 'You can only review products you purchased' });

        // prevent duplicate review
        const existing = product.reviews.find(r => r.user.toString() === req.user.id);
        if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

        const review = {
            user: req.user.id,
            name: req.user.username || req.user.email || 'User',
            rating: Number(rating),
            comment: comment || ''
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        const avg = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
        product.rating = Math.round((avg + Number.EPSILON) * 10) / 10; // one decimal

        await product.save();

        return res.status(201).json({ message: 'Review added', reviews: product.reviews, rating: product.rating, numReviews: product.numReviews });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {getProducts, getProductById, createProduct, updateProduct, deleteProduct, checkPurchase, addReview};