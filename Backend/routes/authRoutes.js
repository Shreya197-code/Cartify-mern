const express = require('express');
const router = express.Router();
const { registerUser, loginuser, getUser, verifyOtp, forgotPassword, resetPassword, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {admin}=require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginuser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/user', protect, getUser);
router.put('/user', protect, updateProfile);
router.put('/change-password', protect, changePassword);



module.exports = router;