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

// exports moved below after all function declarations

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // basic email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const user = await User.findOne({ email });

        // Always return success response to avoid user enumeration
        if (!user) {
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
        }

        // generate token and store hashed token + expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `You requested a password reset for your Cartify account.
Please click the link below to reset your password (valid for 1 hour):
${resetUrl}

If you did not request this, please ignore this email.`;

        try {
            await sendEmail(email, 'Cartify - Password Reset', message);
        } catch (err) {
            console.error('Error sending reset email:', err.message);
            // do not reveal failure to the client
        }

        return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });

    } catch (error) {
        return serverError(res, error);
    }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) return res.status(400).json({ message: 'Token is required' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // hash new password and clear reset fields
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;

        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        return serverError(res, error);
    }
};

// ================= UPDATE PROFILE =================

const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username && !email) {
            return res.status(400).json({ message: 'Nothing to update' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check for email/username conflicts
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }

        if (username && username !== user.username) {
            const existing = await User.findOne({ username });
            if (existing) return res.status(400).json({ message: 'Username already in use' });
            user.username = username;
        }

        await user.save();

        const safeUser = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({ message: 'Profile updated', user: safeUser });

    } catch (error) {
        return serverError(res, error);
    }
};

// ================= CHANGE PASSWORD =================

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old and new passwords are required' });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        return serverError(res, error);
    }
};

    module.exports = {
        registerUser,
        loginuser,
        verifyOtp,
        getUser,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword
    };