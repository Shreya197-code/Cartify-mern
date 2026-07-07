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
    ]

});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;

