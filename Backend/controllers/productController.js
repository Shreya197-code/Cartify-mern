const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary=require('../config/cloudinary');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error){
        res.status(500).json({message: 'Server error'});
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

const createProduct=async(req,res)=>{
    const{name, description, price, category, stock} = req.body;
    let imageUrl = '';
    try {
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }
        const product = new Product({name, description, price, category, stock, imageUrl});
        await product.save();
        res.status(201).json(product);
    } catch (error) {
            console.log("CREATE PRODUCT ERROR:", error);
        res.status(500).json({message: 'Server error', error: error.message});
    }

};

const updateProduct = async (req,res)=>{
    try{
        const {name,description,price,category,stock}=req.body;
        const product = await Product.findById(req.params.id);
        if(product){
            product.name=name||product.name;
            product.description=description||product.description;
            product.price=price||product.price;
            product.category=category||product.category;
            product.stock=stock||product.stock;

            if(req.file){
                const result= await cloudinary.uploader.upload(req.file.path);
                console.log(result);
                product.imageUrl=result.secure_url;
            }
            const updatedProduct= await product.save();
            res.json(updatedProduct);
        
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}

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