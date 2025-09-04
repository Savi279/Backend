import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/order').post(auth, createRazorpayOrder);
router.route('/verify').post(auth, verifyPayment);

export default router;
