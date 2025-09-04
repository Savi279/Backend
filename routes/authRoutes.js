import express from 'express';
import { body } from 'express-validator';
import { registerUser, verifyOtp, loginUser, getLoggedInUser, updateUserProfile, checkUser } from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user & send OTP
// @access  Public
router.post(
    '/register',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    registerUser
);

// @route   POST api/auth/check-user
// @desc    Check if user exists and send OTP
// @access  Public
router.post(
    '/check-user',
    [
        body('email', 'Please include a valid email').isEmail(),
    ],
    checkUser
);

// @route   POST api/auth/verify-otp
// @desc    Verify OTP and activate user
// @access  Public
router.post(
    '/verify-otp',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('otp', 'OTP is required and must be 6 digits').isLength({ min: 6, max: 6 }),
    ],
    verifyOtp
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token (or send OTP if not verified)
// @access  Public
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    loginUser
);

// @route   GET api/auth/user
// @desc    Get logged in user profile
// @access  Private
router.get('/user', auth, getLoggedInUser);

// @route   PUT api/auth/user
// @desc    Update user profile
// @access  Private
router.put('/user', auth, updateUserProfile);

export default router;