import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/dashboard').get(auth, admin, getDashboardAnalytics);

export default router;