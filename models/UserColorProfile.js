import mongoose from 'mongoose';

const userColorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  skinTone: {
    type: String,
    enum: ['fair', 'light', 'medium', 'tan', 'dark'],
    required: true,
  },
  hairColor: {
    type: String,
    enum: ['blonde', 'brown', 'black', 'red', 'grey'],
    required: true,
  },
  eyeColor: {
    type: String,
    enum: ['blue', 'green', 'brown', 'hazel', 'grey'],
    required: true,
  },
  // Storing suggested color palettes as an array of strings (e.g., hex codes or color names)
  suggestedColors: [
    {
      name: { type: String },
      hex: { type: String },
    }
  ],
  analysisDate: {
    type: Date,
    default: Date.now,
  },
});

const UserColorProfile = mongoose.model('UserColorProfile', userColorProfileSchema);

export default UserColorProfile;
