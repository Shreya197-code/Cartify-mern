const express = require('express');
const router = express.Router();
const { registerUser, loginuser, getUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {admin}=require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginuser);
router.get('/user',protect,admin, getUser);

module.exports = router;