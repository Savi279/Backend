import Product from '../models/Product.js';
import Category from '../models/Category.js'; // To validate category existence
import { validationResult } from 'express-validator';

// @route   POST api/products
// @desc    Create a new product
// @access  Private (Admin only)
const createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, tagline, category, stock, material, care, details, sizes, rating, reviews, views } = req.body;

    try {
        // Validate if category exists
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(400).json({ msg: 'Category not found' });
        }

        // Handle image uploads
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Convert sizes from JSON string if needed (for form submission)
        let parsedSizes = [];
        if (typeof sizes === 'string') {
            try {
                parsedSizes = JSON.parse(sizes);
            } catch (e) {
                return res.status(400).json({ msg: 'Invalid sizes format' });
            }
        } else if (Array.isArray(sizes)) {
            parsedSizes = sizes;
        }

        // Ensure reviews is an array of objects, not a number
        let parsedReviews = [];
        if (typeof reviews === 'string') {
            try {
                parsedReviews = JSON.parse(reviews);
            } catch (e) {
                parsedReviews = [];
            }
        } else if (Array.isArray(reviews)) {
            parsedReviews = reviews;
        } else {
            parsedReviews = [];
        }

        // Determine default price from XS size if available
        let defaultPrice = 0;
        const xsSize = parsedSizes.find(s => s.size.toLowerCase() === 'xs');
        if (xsSize && xsSize.price) {
            defaultPrice = parseFloat(xsSize.price);
        } else if (parsedSizes.length > 0) {
            defaultPrice = parseFloat(parsedSizes[0].price) || 0;
        } else {
            defaultPrice = 0;
        }

        const newProduct = new Product({
            name,
            description,
            tagline,
            price: defaultPrice,
            images: imageUrls,
            category,
            stock,
            material,
            care,
            details: details ? (Array.isArray(details) ? details : [details]) : [],
            sizes: parsedSizes,
            rating: rating || 0,
            reviews: parsedReviews,
            views: views || 0,
        });

        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @route   GET api/products
// @desc    Get all products
// @access  Public
const getAllProducts = async (req, res) => {
    try {
        const { categoryId } = req.query;
        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }
        // Populate category details for each product
        const products = await Product.find(query).populate('category', 'name').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @route   GET api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        // Check for invalid ObjectId format for categoryId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name').populate('reviews.user', 'name');
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @route   POST api/products/:id/view
// @desc    Increment view count for a product
// @access  Public
const incrementView = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        product.views += 1;
        await product.save();
        res.json({ views: product.views });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   POST api/products/:id/review
// @desc    Submit a review for a product
// @access  Private
const submitReview = async (req, res) => {
    const { rating, comment } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check if user already reviewed
        const existingReview = product.reviews.find(review => review.user.toString() === userId);
        if (existingReview) {
            return res.status(400).json({ msg: 'You have already reviewed this product' });
        }

        const newReview = {
            user: userId,
            rating,
            comment,
        };

        product.reviews.push(newReview);
        product.reviewCount = product.reviews.length;

        // Recalculate average rating
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.rating = totalRating / product.reviews.length;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, tagline, category, stock, material, care, details, sizes, rating, reviews, views } = req.body;

    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Validate if new category exists if provided
        if (category) {
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                return res.status(400).json({ msg: 'Category not found' });
            }
        }

        // Convert sizes from JSON string if needed (for form submission)
        let parsedSizes = [];
        if (typeof sizes === 'string') {
            try {
                parsedSizes = JSON.parse(sizes);
            } catch (e) {
                return res.status(400).json({ msg: 'Invalid sizes format' });
            }
        } else if (Array.isArray(sizes)) {
            parsedSizes = sizes;
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.tagline = tagline || product.tagline;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.material = material || product.material;
        product.care = care || product.care;
        product.details = details ? (Array.isArray(details) ? details : [details]) : product.details;
        if (parsedSizes.length > 0) {
            product.sizes = parsedSizes;
            product.price = parsedSizes[0]?.price || product.price;
        }
        product.rating = rating !== undefined ? rating : product.rating;
        product.reviews = reviews !== undefined ? reviews : product.reviews;
        product.views = views !== undefined ? views : product.views;

        // Handle image update
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            product.images = newImageUrls;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Delete the associated image files from local storage
        if (product.images && product.images.length > 0) {
            const fs = await import('fs');
            const path = await import('path');
            const { fileURLToPath } = await import('url');
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            product.images.forEach(imageUrl => {
                if (imageUrl.startsWith('/uploads')) {
                    const imagePath = path.join(__dirname, '..', imageUrl);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
};

export { createProduct, getAllProducts, getProductsByCategory, getProductById, updateProduct, deleteProduct, incrementView, submitReview };