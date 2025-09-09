import express from 'express';
import {
  getCart,
  addToCart,
  removeItem,
  updateItem,
} from '../controllers/cartController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(auth, getCart).post(auth, addToCart);
router
  .route('/:productId/:size')
  .delete(auth, removeItem)
  .put(auth, updateItem);

export default router;
