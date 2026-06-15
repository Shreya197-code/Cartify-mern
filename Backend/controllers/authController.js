const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// REGISTER USER
const registerUser = async (req, res) => {

    console.log("REGISTER BODY:", req.body); //

    const { username, email, password } = req.body;

    try {
        // check duplicate user (email OR username)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // OTP (optional feature)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const message = `Welcome to Cartify ${username}! 
Your OTP is: ${otp}`;

        // email (safe, won't break API)
        try {
            await sendEmail(email, 'Welcome to Cartify', message);
        } catch (err) {
            console.log("Email failed but user created:", err.message);
        }

        return res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Duplicate key error (user already exists)"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// LOGIN USER
const loginuser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            return res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }

        return res.status(400).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET USER (protected)
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginuser, getUser };