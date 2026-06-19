const express = require('express');
const router = express.Router();
const { registerUser, loginuser, getUser,verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {admin}=require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginuser);
router.post('/verify-otp', verifyOtp);
router.get('/user',protect,admin, getUser);



module.exports = router;