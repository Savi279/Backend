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

    const { name, description, tagline, price, imageUrl, category, stock } = req.body;

    try {
        // Validate if category exists
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(400).json({ msg: 'Category not found' });
        }

        const newProduct = new Product({
            name,
            description,
            tagline,
            price,
            imageUrl,
            category,
            stock,
        });

        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/products
// @desc    Get all products
// @access  Public
const getAllProducts = async (req, res) => {
    try {
        // Populate category details for each product
        const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        res.status(500).send('Server Error');
    }
};

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
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

    const { name, description, tagline, price, imageUrl, category, stock } = req.body;

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

        product.name = name || product.name;
        product.description = description || product.description;
        product.tagline = tagline || product.tagline;
        product.price = price || product.price;
        product.imageUrl = imageUrl || product.imageUrl;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock; // Allow stock to be 0

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
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

        await Product.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};

export { createProduct, getAllProducts, getProductsByCategory, getProductById, updateProduct, deleteProduct };
