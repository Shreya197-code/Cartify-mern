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
    const{name, description, price, category} = req.body;
    try {
        const product = new Product({name, description, price, category});
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}