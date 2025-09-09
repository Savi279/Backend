// backend/routes/productRoutes.js
import express from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/authMiddleware.js'; // Middleware for authentication
import admin from '../middleware/adminMiddleware.js'; // Middleware for admin authorization
import Product from '../models/Product.js'; // Product Mongoose model
import Category from '../models/Category.js'; // Category Mongoose model
import upload from '../middleware/upload.js'; // <--- NEW: Import the Multer upload middleware
import fs from 'fs'; // Node.js File System module for deleting files
import path from 'path'; // Node.js Path module to construct file paths
import { fileURLToPath } from 'url'; // <--- NEW: For __dirname equivalent in ES modules
import {
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  incrementView,
  submitReview
} from '../controllers/productsController.js';

const router = express.Router();

// --- NEW: Configuration for __dirname equivalent in ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- END NEW ---


// @route    POST api/products
// @desc     Create a new product with image upload
// @access   Private (Admin only)
router.post(
    '/',
    [
        auth,   // Authenticate the user
        admin,  // Authorize only admin users
        upload, // <--- NEW: Apply Multer upload middleware here to process the 'image' file
        [
            // Validation checks for product fields
            check('name', 'Name is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            // Price must be a non-negative float (for Indian Rupees)
            check('price', 'Price is required and must be a non-negative number').isFloat({ min: 0 }),
            check('category', 'Category is required').not().isEmpty(),
            check('stock', 'Stock is required and must be a non-negative integer').isInt({ gt: -1 }),
        ],
    ],
    createProduct
);

// @route    GET api/products
// @desc     Get all products or filter by category
// @access   Public
router.get('/', getAllProducts);

// @route    GET api/products/category/:categoryId
// @desc     Get products by category
// @access   Public
router.get('/category/:categoryId', getProductsByCategory);

// @route    GET api/products/:id
// @desc     Get a single product by its ID
// @access   Public
router.get('/:id', getProductById);

// @route    PUT api/products/:id
// @desc     Update an existing product with optional image upload
// @access   Private (Admin only)
router.put(
    '/:id',
    [
        auth,
        admin,
        upload, // <--- NEW: Apply Multer upload middleware here
        [
            // Validation checks for product fields (similar to POST)
            check('name', 'Name is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            check('price', 'Price is required and must be a non-negative number').isFloat({ min: 0 }),
            check('category', 'Category is required').not().isEmpty(),
            check('stock', 'Stock is required and must be a non-negative integer').isInt({ gt: -1 }),
        ],
    ],
    updateProduct
);

// @route    DELETE api/products/:id
// @desc     Delete a product and its associated image
// @access   Private (Admin only)
router.delete('/:id', [auth, admin], deleteProduct);

// @route    POST api/products/:id/view
// @desc     Increment view count for a product
// @access   Public
router.post('/:id/view', incrementView);

// @route    POST api/products/:id/review
// @desc     Submit a review for a product
// @access   Private
router.post('/:id/review', auth, submitReview);


export default router;
