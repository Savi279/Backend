import express from 'express';
import { 
    getPromotions,
    createPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion
} from '../controllers/promotionsController.js';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

// Routes for promotions
router.route('/').get(auth, admin, getPromotions).post(auth, admin, createPromotion);
router.route('/:id').get(auth, admin, getPromotionById).put(auth, admin, updatePromotion).delete(auth, admin, deletePromotion);

export default router;