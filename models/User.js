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
    addresses: [{
        label: {
            type: String,
            required: true,
        },
        houseFlatNo: {
            type: String,
            required: true,
        },
        building: {
            type: String,
        },
        area: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pin: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', UserSchema);
export default User;
