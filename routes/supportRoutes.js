import express from 'express';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicket,
  addComment
} from '../controllers/supportController.js';

const router = express.Router();

// @route    POST api/support
// @desc     Create a support ticket
// @access   Private
router.post('/', auth, createTicket);

// @route    GET api/support/my-tickets
// @desc     Get user's support tickets
// @access   Private
router.get('/my-tickets', auth, getUserTickets);

// @route    GET api/support
// @desc     Get all support tickets
// @access   Private/Admin
router.get('/', [auth, admin], getAllTickets);

// @route    PUT api/support/:id
// @desc     Update ticket status
// @access   Private/Admin
router.put('/:id', [auth, admin], updateTicket);

// @route    POST api/support/:id/comment
// @desc     Add comment to ticket
// @access   Private
router.post('/:id/comment', auth, addComment);

export default router;
