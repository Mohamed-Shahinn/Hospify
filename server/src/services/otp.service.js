const crypto = require('crypto');
const { createTransporter } = require('../config/email-config');

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};
const sendOTPEmail = async (email, otp) => {
    const transporter = createTransporter(); // picks provider from .env

    const senderMap = {
        gmail: process.env.GMAIL_USER,
        outlook: process.env.OUTLOOK_USER,
    };

    const from = senderMap[process.env.EMAIL_PROVIDER];

    await transporter.sendMail({
        from,
        to: email,
        subject: 'Password Reset OTP',
        html: `
      <h2>Password Reset Request</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code expires in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
    });
};

module.exports = { generateOTP, sendOTPEmail };