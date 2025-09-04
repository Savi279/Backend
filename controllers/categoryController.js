import Category from '../models/Category.js';
import { validationResult } from 'express-validator';

// @route   POST api/categories
// @desc    Create a new category
// @access  Private (Admin only)
const createCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ msg: 'Category with this name already exists' });
        }

        category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        console.error(err.message);
        // Check for invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        // Check if new name already exists for another category
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ msg: 'Category with this name already exists' });
            }
        }

        category.name = name || category.name;
        category.description = description || category.description;

        await category.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        await Category.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.status(500).send('Server Error');
    }
};

export { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
