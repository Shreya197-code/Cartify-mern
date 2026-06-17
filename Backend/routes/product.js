const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {admin}=require('../middleware/adminMiddleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController.js');
const router = express.Router();
const multer = require('multer');
const upload =multer({dest:'uploads/'}); 


router.route('/').get(getProducts).post(protect,admin, upload.single('image'), createProduct);
router.route('/:id').get(getProductById).put(protect,admin, upload.single('image'), updateProduct).delete(protect,admin, deleteProduct);

module.exports = router;