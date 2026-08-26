const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type:String , required:true},
    description: {type:String , required:true},
    price: {type:Number , required:true},
    category: {type:String , required:true},
    stock: {type:Number , required:true},
    imageUrl: {type:String , required:true},
    createdAt: {type:Date , default:Date.now},
    rating: {type:Number , default:0},
    numReviews: {type:Number , default:0},
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    embedding: {
        type: [Number],
        select: false // Exclude from normal queries by default
    }
}, { timestamps: true });

// Text index for fast keyword search
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

