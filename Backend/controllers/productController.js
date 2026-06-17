const Product = require('../models/Product');
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
            const updatedProduct= await product.save;
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
            await Product.deleteOne();
            res.json({message: 'Product deleted successfully'});
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error' ,error: error.message});

    }
};

module.exports = {getProducts, getProductById, createProduct, updateProduct, deleteProduct};