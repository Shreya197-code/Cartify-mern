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
        const normalizedEmail = email.toLowerCase().trim();
        const trimmedUsername = username.trim();

        // Check if a user with this email or username already exists
        const existingEmailUser = await User.findOne({ email: normalizedEmail });
        const existingUsernameUser = await User.findOne({ username: trimmedUsername });

        // If email is already verified
        if (existingEmailUser && existingEmailUser.verified) {
            return res.status(400).json({
                message: 'An account with this email already exists. Please log in.'
            });
        }

        // If username is already taken by a verified user
        if (existingUsernameUser && existingUsernameUser.verified && existingUsernameUser.email !== normalizedEmail) {
            return res.status(400).json({
                message: 'This username is already taken. Please choose a different username.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const hashedOtpValue = hashOtp(otp);
        const otpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 mins

        let user;
        if (existingEmailUser && !existingEmailUser.verified) {
            // User registered previously but did not complete OTP verification: update record with new OTP & password
            existingEmailUser.username = trimmedUsername;
            existingEmailUser.password = hashedPassword;
            existingEmailUser.otp = hashedOtpValue;
            existingEmailUser.otpExpiry = otpExpiryTime;
            user = await existingEmailUser.save();
        } else {
            // Create new user
            user = await User.create({
                username: trimmedUsername,
                email: normalizedEmail,
                password: hashedPassword,
                otp: hashedOtpValue,
                otpExpiry: otpExpiryTime
            });
        }

        const message = `Welcome to Cartify, ${user.username}!
Your verification OTP is: ${otp} (valid for 10 minutes).

Enter this OTP to activate your account.`;

        const htmlMessage = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
    <h2 style="color: #2563eb; margin-top: 0;">🛍️ Welcome to Cartify!</h2>
    <p style="color: #334155; font-size: 15px;">Hi <strong>${user.username}</strong>,</p>
    <p style="color: #334155; font-size: 15px;">Thank you for registering. Please use the following 6-digit OTP code to verify your email address:</p>
    <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1d4ed8;">${otp}</span>
    </div>
    <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. If you did not sign up for Cartify, please ignore this email.</p>
</div>`;

        // Prominently log the OTP to the console for instant testing
        console.log(`\n========================================\n[CARTIFY REGISTRATION OTP]\nRecipient: ${user.email}\nCode: ${otp}\n========================================\n`);

        try {
            await sendEmail(
                user.email,
                'Cartify - Your Verification OTP Code',
                message,
                htmlMessage
            );
        } catch (err) {
            console.error('Email failed during registration:', err.message);
        }

        return res.status(201).json({
            message: 'OTP sent to email',
            email: user.email
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Username or email already in use. Please try a different one.'
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

// ================= RESEND OTP =================

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const otp = generateOtp();
        user.otp = hashOtp(otp);
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const message = `Hello ${user.username},
Your new Cartify OTP is: ${otp} (valid for 10 minutes).`;

        const htmlMessage = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
    <h2 style="color: #2563eb; margin-top: 0;">🛍️ Cartify Verification Code</h2>
    <p style="color: #334155; font-size: 15px;">Hi <strong>${user.username}</strong>,</p>
    <p style="color: #334155; font-size: 15px;">Here is your new 6-digit OTP code to verify your email:</p>
    <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1d4ed8;">${otp}</span>
    </div>
    <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes.</p>
</div>`;

        // Prominently log the OTP to the console for instant testing
        console.log(`\n========================================\n[CARTIFY RESEND OTP]\nRecipient: ${user.email}\nCode: ${otp}\n========================================\n`);

        try {
            await sendEmail(email, 'Cartify - New Verification OTP Code', message, htmlMessage);
        } catch (err) {
            console.error('Email failed during OTP resend:', err.message);
        }

        return res.status(200).json({
            message: 'A new OTP has been sent to your email',
            email: user.email
        });

    } catch (error) {
        return serverError(res, error);
    }
};

module.exports = {
    registerUser,
    loginuser,
    verifyOtp,
    resendOtp,
    getUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
};