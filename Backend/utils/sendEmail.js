const nodemailer = require('nodemailer');

/**
 * Creates an SMTP Transporter with connection verification
 */
const createTransporter = () => {
    const user = (process.env.EMAIL_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || '').trim();

    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send Transactional Email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} [html] - Optional HTML body
 */
const sendEmail = async (to, subject, text, html) => {
    const recipient = (to || '').trim().toLowerCase();
    const senderEmail = (process.env.EMAIL_USER || '').trim();
    const senderName = 'Cartify Store';

    if (!recipient) {
        throw new Error('Recipient email is required');
    }

    if (!senderEmail || !process.env.EMAIL_PASS) {
        console.warn('⚠️ [EMAIL WARNING] EMAIL_USER or EMAIL_PASS not set in .env');
        throw new Error('Email credentials not configured');
    }

    const defaultHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 8px; }
        .content { color: #334155; font-size: 15px; line-height: 1.6; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🛍️ Cartify</div>
            <div class="title">${subject}</div>
        </div>
        <div class="content">
            <p>${text.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="footer">
            <p>If you did not request this code, please ignore this email.<br>© ${new Date().getFullYear()} Cartify Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

    const transporter = createTransporter();

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        replyTo: senderEmail,
        to: recipient,
        subject: subject,
        text: text,
        html: html || defaultHtml,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
        }
    };

    console.log(`\n📧 [EMAIL DISPATCH] Sending OTP email to ${recipient}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL DISPATCH SUCCESS] Accepted: ${JSON.stringify(info.accepted)} | MessageId: ${info.messageId}`);
    return info;
};

module.exports = sendEmail;