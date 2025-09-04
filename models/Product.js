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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category model
        required: true,
    },
    stock: {
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
