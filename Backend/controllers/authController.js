const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d'
    });
}

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });

const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

       const user = User.create({ username, email, password: hashedPassword });
       if(user){
        const otp=Math.floor(100000 + Math.random() * 900000).toString();
        const message = `Welcome to Cartify! , ${username}! Thank you for registering with us. We are excited to have you on board. To complete your registration, please use the following One-Time Password (OTP) to verify your email address:
        Your OTP for Cartify registration is: ${otp}`;

        await sendEmail(email, 'Welcome to Cartify - Verify Your Email', message);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } 
    else{
        res.status(400).json({ message: 'Invalid user data' });
    }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


//Login user

const loginuser = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user=await User.findOne({email});
        if(user && (await bcrypt.compare(password,user.password))){
            res.json({
                id:user._id,
                username:user.username,
                email:user.email,
                role:user.role,
                token:generateToken(user._id)
            });
        }
        else{
            res.status(400).json({message:'Invalid credentials'});
        }
    }
    catch(error){
        res.status(500).json({message:'Server error'});
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginuser, getUser };