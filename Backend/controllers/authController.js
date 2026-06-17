const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ================= HELPERS =================

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

const hashOtp = (otp) =>
    crypto.createHash('sha256').update(otp).digest('hex');

const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const serverError = (res, error) => {
    console.log(error);
    return res.status(500).json({
        message: 'Server error',
        error: error.message
    });
};

// ================= REGISTER =================

const registerUser = async (req, res) => {
    console.log('REGISTER BODY:', req.body);

    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOtp();

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            otp: hashOtp(otp),
            otpExpiry: Date.now() + 10 * 60 * 1000
        });

        const message = `Welcome to Cartify ${username}!
Your OTP is: ${otp}`;

        try {
            await sendEmail(
                email,
                'Welcome to Cartify',
                message
            );
        } catch (err) {
            console.log(
                'Email failed but user created:',
                err.message
            );
        }

        return res.status(201).json({
            message: 'OTP sent to email',
            email: user.email
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    'Duplicate key error (user already exists)'
            });
        }

        return serverError(res, error);
    }
};

// ================= LOGIN =================

const loginuser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({
                message: 'Invalid credentials'
            });

        if (!user.verified)
            return res.status(400).json({
                message: 'Please verify your email first'
            });

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch)
            return res.status(400).json({
                message: 'Invalid credentials'
            });

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        return serverError(res, error);
    }
};

// ================= VERIFY OTP =================

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                message: 'User not found'
            });

        if (user.otp !== hashOtp(otp))
            return res.status(400).json({
                message: 'Invalid OTP'
            });

        if (user.otpExpiry < Date.now())
            return res.status(400).json({
                message: 'OTP expired'
            });

        user.verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        res.json({
            message: 'Email verified successfully'
        });

    } catch (error) {
        return serverError(res, error);
    }
};

// ================= GET USER =================

const getUser = async (req, res) => {
    try {
        const user = await User.findById(
            req.user.id
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.json(user);

    } catch (error) {
        return serverError(res, error);
    }
};

module.exports = {
    registerUser,
    loginuser,
    verifyOtp,
    getUser
};