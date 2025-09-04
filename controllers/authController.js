import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { sendOtpEmail } from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ user: { id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// @route   POST api/auth/check-user
// @desc    Send OTP and tell frontend whether user exists
// @access  Public
const checkUser = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.deleteMany({ email }); // clear old OTPs
        const newOtp = new Otp({ email, otp: otpCode });
        await newOtp.save();

        // Send OTP email
        await sendOtpEmail(email, otpCode);

        res.status(200).json({
            userExists: !!user,
            msg: 'OTP sent to your email for verification.',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/auth/verify-otp
// @desc    Verify OTP and tell frontend if user exists
// @access  Public
const verifyOtp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // clean up OTP after success
        await Otp.deleteOne({ _id: otpRecord._id });

        // Check if user exists
        const user = await User.findOne({ email });

        if (user) {
            return res.status(200).json({
                userExists: true,
                msg: 'OTP verified. Please login with your password.',
            });
        } else {
            return res.status(200).json({
                userExists: false,
                msg: 'OTP verified. Please create a new account.',
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/auth/register
// @desc    Register user (after OTP verified)
// @access  Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, mobile, username } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            username,
            password,
            mobile,
            role: role || 'customer',
            isVerified: true, // already verified through OTP
        });

        // hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = generateToken(user.id);
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        };

        res.status(200).json({
            msg: 'User registered successfully.',
            token,
            user: userResponse,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/auth/login
// @desc    Authenticate user with email + password
// @access  Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ msg: 'Account not verified.' });
        }

        const token = generateToken(user.id);
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            mobile: user.mobile,
            address: user.address,
        };
        res.json({ token, role: user.role, user: userResponse });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/auth/user
// @desc    Get logged in user profile
// @access  Private
const getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/auth/user
// @desc    Update user profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export {
    checkUser,
    verifyOtp,
    registerUser,
    loginUser,
    getLoggedInUser,
    updateUserProfile,
};
