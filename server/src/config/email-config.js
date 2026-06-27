const nodemailer = require('nodemailer');

const createTransporter = (provider = process.env.EMAIL_PROVIDER) => {
    const configs = {
        gmail: {
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        },
        outlook: {
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.OUTLOOK_USER,
                pass: process.env.OUTLOOK_PASS,
            },
        },
    };

    const selected = configs[provider];
    if (!selected) throw new Error(`Unsupported email provider: ${provider}`);

    return nodemailer.createTransport(selected);
};

module.exports = { createTransporter };