import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Clothing Brand Registration/Login',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #0056b3;">Hello there!</h2>
                <p>Thank you for registering/logging in to our clothing brand website.</p>
                <p>Your One-Time Password (OTP) is:</p>
                <h3 style="color: #d9534f; font-size: 24px;">${otp}</h3>
                <p>This OTP is valid for 5 minutes. Please do not share this with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Regards,<br>Your Clothing Brand Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${email}:`, error);
        throw new Error('Failed to send OTP email.');
    }
};

export { sendOtpEmail };