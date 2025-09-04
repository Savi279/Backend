import express from 'express';
import { analyzeColors, getUserColorProfile } from '../controllers/colorAnalysisController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(auth, analyzeColors).get(auth, getUserColorProfile);

export default router;
