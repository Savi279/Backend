import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'], // Users can be either 'customer' or 'admin'
        default: 'customer',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    mobile: {
        type: String,
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', UserSchema);
export default User;
