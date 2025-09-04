import express from 'express';
import { body } from 'express-validator';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

// @route   POST api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post(
    '/',
    [
        auth,
        admin,
        body('name', 'Category name is required').not().isEmpty(),
    ],
    createCategory
);

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', getCategoryById);

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put(
    '/:id',
    [
        auth,
        admin,
        body('name', 'Category name is required').not().isEmpty(),
    ],
    updateCategory
);

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], deleteCategory);

export default router;