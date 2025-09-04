import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
} from '../controllers/cartController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(auth, getCart).post(auth, addToCart);
router
  .route('/:productId/:size')
  .delete(auth, removeFromCart)
  .put(auth, updateCartItem);

export default router;
