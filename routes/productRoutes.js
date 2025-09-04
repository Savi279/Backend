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
  deleteProduct
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
            // Price must be a positive float (for Indian Rupees)
            check('price', 'Price is required and must be a positive number').isFloat({ gt: 0 }),
            check('category', 'Category is required').not().isEmpty(),
            check('stock', 'Stock is required and must be a non-negative integer').isInt({ gt: -1 }),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If validation fails, and a file was uploaded, delete the uploaded file
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file after validation failure:', err);
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, tagline, price, category, stock } = req.body;

        try {
            // Verify that the provided category ID exists
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                // If category not found, and a file was uploaded, delete it
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting file after invalid category:', err);
                    });
                }
                return res.status(400).json({ msg: 'Category not found' });
            }

            // Determine the imageUrl: if a file was uploaded, use its path; otherwise, use a placeholder.
            let imageUrl = 'https://placehold.co/600x400/cccccc/000000?text=Product+Image'; // Default placeholder
            if (req.file) {
                // The URL path for the image, assuming the server serves '/uploads' statically
                imageUrl = `/uploads/${req.file.filename}`;
            }

            // Create a new Product instance
            const newProduct = new Product({
                name,
                description,
                tagline,
                price,
                imageUrl, // Store the generated image URL
                category,
                stock,
            });

            // Save the product to the database
            const product = await newProduct.save();
            res.json(product); // Respond with the newly created product
        } catch (err) {
            console.error(err.message);
            // If any server error occurs during product save, and a file was uploaded, delete it
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file after database error:', err);
                });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route    GET api/products
// @desc     Get all products or filter by category
// @access   Public
router.get('/', async (req, res) => {
    try {
        const { categoryId } = req.query; // Get categoryId from query parameters (e.g., /api/products?categoryId=...)
        let products;

        if (categoryId && categoryId !== 'all') { // Added check for 'all' to ensure proper filtering
            products = await Product.find({ category: categoryId }).populate('category', 'name').sort({ date: -1 });
        } else {
            products = await Product.find().populate('category', 'name').sort({ date: -1 });
        }
        res.json(products); // Respond with the list of products
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/products/:id
// @desc     Get a single product by its ID
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err.message);
        // Check if the error is due to an invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});

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
            check('price', 'Price is required and must be a positive number').isFloat({ gt: 0 }),
            check('category', 'Category is required').not().isEmpty(),
            check('stock', 'Stock is required and must be a non-negative integer').isInt({ gt: -1 }),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If validation fails, and a file was uploaded, delete it
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file after validation failure:', err);
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, tagline, price, category, stock } = req.body;

        // Build an object with the fields to update
        const productFields = {
            name,
            description,
            tagline,
            price,
            category,
            stock,
            // Initialize imageUrl with the existing one from req.body if no new file is uploaded
            // This handles cases where the user doesn't change the image
            imageUrl: req.body.imageUrl // Frontend might send current imageUrl if no new file selected
        };

        try {
            let product = await Product.findById(req.params.id);

            if (!product) {
                // If product not found, and a file was uploaded, delete it
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting file after product not found:', err);
                    });
                }
                return res.status(404).json({ msg: 'Product not found' });
            }

            // Verify that the provided category ID exists
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                // If category not found, and a file was uploaded, delete it
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting file after invalid category:', err);
                    });
                }
                return res.status(400).json({ msg: 'Category not found' });
            }

            // If a new file has been uploaded:
            if (req.file) {
                // 1. Delete the old image file from the server, but only if it's not a placeholder
                if (product.imageUrl && product.imageUrl.startsWith('/uploads')) {
                    const oldImagePath = path.join(__dirname, '..', product.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error('Error deleting old product image:', err);
                        });
                    }
                }
                // 2. Update the imageUrl to the new uploaded file's path
                productFields.imageUrl = `/uploads/${req.file.filename}`;
            } else if (req.body.clearImage === 'true') {
                 // If the frontend explicitly sends a 'clearImage' flag, delete the existing image
                 if (product.imageUrl && product.imageUrl.startsWith('/uploads')) {
                    const oldImagePath = path.join(__dirname, '..', product.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error('Error deleting old product image (clearImage flag):', err);
                        });
                    }
                 }
                 // Set a placeholder image URL
                 productFields.imageUrl = 'https://placehold.co/600x400/cccccc/000000?text=Product+Image';
            }


            // Find the product by ID and update it
            product = await Product.findOneAndUpdate(
                { _id: req.params.id },
                { $set: productFields }, // Set the updated fields
                { new: true } // Return the updated document
            ).populate('category', 'name'); // Populate category details

            res.json(product); // Respond with the updated product
        } catch (err) {
            console.error(err.message);
            // If any server error occurs during product update, and a new file was uploaded, delete it
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file after database error during update:', err);
                });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route    DELETE api/products/:id
// @desc     Delete a product and its associated image
// @access   Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Delete the associated image file from local storage
        // Only delete if it's a locally stored image (starts with /uploads) and not a placeholder
        if (product.imageUrl && product.imageUrl.startsWith('/uploads')) {
            const imagePath = path.join(__dirname, '..', product.imageUrl); // Construct absolute path
            if (fs.existsSync(imagePath)) { // Check if file exists
                fs.unlink(imagePath, (err) => { // Delete the file
                    if (err) console.error('Error deleting product image:', err);
                });
            }
        }

        // Delete the product from the database
        await Product.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Product removed' }); // Respond with a success message
    } catch (err) {
        console.error(err.message);
        // Handle invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});


export default router;
