import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
} from '../controllers/orderController.js';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').post(auth, createOrder).get(auth, admin, getAllOrders);
router.route('/myorders').get(auth, getUserOrders);
router.route('/:id').get(auth, getOrderById);
router.route('/:id/pay').put(auth, updateOrderToPaid);
router.route('/:id/deliver').put(auth, admin, updateOrderToDelivered);

export default router;

