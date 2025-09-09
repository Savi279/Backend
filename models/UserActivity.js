import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'view_product', 'add_to_cart', 'remove_from_cart', 'add_to_favorites', 'remove_from_favorites', 'place_order', 'cancel_order', 'review_product', 'update_profile'],
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible object for additional details
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
