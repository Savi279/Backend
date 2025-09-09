import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import crypto from 'crypto';

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ msg: 'Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env' });
  }

  const { amount, currency = 'INR', receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ msg: 'Failed to create order' });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ msg: 'Razorpay key secret not configured. Please add RAZORPAY_KEY_SECRET to .env' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    try {
      // Update order payment status in DB
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'paid',
        update_time: new Date(),
        email_address: req.user.email,
      };
      await order.save();

      res.json({ msg: 'Payment verified successfully' });
    } catch (error) {
      console.error('Error updating order payment status:', error);
      res.status(500).json({ msg: 'Failed to update order payment status' });
    }
  } else {
    res.status(400).json({ msg: 'Invalid payment signature' });
  }
};

export { createRazorpayOrder, verifyPayment };
