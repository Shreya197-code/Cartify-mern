const express = require('express');
const { protect } = require('../middleware/authMiddleware.js');
const {admin}=require('../middleware/adminMiddleware.js');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, checkPurchase, addReview } = require('../controllers/productController.js');
const router = express.Router();
const multer = require('multer');
const upload =multer({dest:'uploads/'}); 


router.route('/').get(getProducts).post(protect,admin, upload.single('image'), createProduct);
router.route('/:id').get(getProductById).put(protect,admin, upload.single('image'), updateProduct).delete(protect,admin, deleteProduct);

// Reviews
router.get('/:id/purchased', protect, checkPurchase);
router.post('/:id/reviews', protect, addReview);

module.exports = router;