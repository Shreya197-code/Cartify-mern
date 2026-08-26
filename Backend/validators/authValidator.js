const { z } = require('zod');

const registerSchema = {
    body: z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters')
    })
};

const loginSchema = {
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
};

const verifyOtpSchema = {
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be 6 digits')
    })
};

const resendOtpSchema = {
    body: z.object({
        email: z.string().email('Invalid email address')
    })
};

const forgotPasswordSchema = {
    body: z.object({
        email: z.string().email('Invalid email address')
    })
};

const resetPasswordSchema = {
    params: z.object({
        token: z.string().min(10, 'Invalid token')
    }),
    body: z.object({
        password: z.string().min(6, 'Password must be at least 6 characters')
    })
};

module.exports = {
    registerSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
