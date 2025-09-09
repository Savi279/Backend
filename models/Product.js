import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    tagline: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        default: 'https://placehold.co/600x400/cccccc/000000?text=Product+Image', // Placeholder image
    },
    images: [{
        type: String, // Array of image URLs for multiple images
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category model
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    material: {
        type: String,
    },
    care: {
        type: String,
    },
    details: [{
        type: String, // Array of detail strings
    }],
    sizes: [{
        size: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
    }],
    rating: {
        type: Number,
        default: 0,
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    }],
    reviewCount: {
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;
