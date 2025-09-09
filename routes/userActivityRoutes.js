import express from 'express';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import {
  logActivity,
  getUserActivities,
  getAllActivities,
  getActivityStats
} from '../controllers/userActivityController.js';

const router = express.Router();

// @route    POST api/user-activity
// @desc     Log user activity
// @access   Private
router.post('/', auth, logActivity);

// @route    GET api/user-activity/stats
// @desc     Get activity statistics
// @access   Private/Admin
router.get('/stats', [auth, admin], getActivityStats);

// @route    GET api/user-activity
// @desc     Get all user activities
// @access   Private/Admin
router.get('/', [auth, admin], getAllActivities);

// @route    GET api/user-activity/:userId
// @desc     Get user activities
// @access   Private/Admin
router.get('/:userId', [auth, admin], getUserActivities);

export default router;
