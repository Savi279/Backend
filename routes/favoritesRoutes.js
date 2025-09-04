import express from 'express';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from '../controllers/favoritesController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(auth, getFavorites);
router.route('/:productId').post(auth, addToFavorites).delete(auth, removeFromFavorites);

export default router;
