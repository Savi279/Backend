import UserActivity from '../models/UserActivity.js';

// @desc    Log user activity
// @route   POST /api/user-activity
// @access  Private
const logActivity = async (req, res) => {
  const { action, details } = req.body;
  const userId = req.user.id;

  try {
    const activity = new UserActivity({
      user: userId,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    await activity.save();
    res.status(201).json({ msg: 'Activity logged successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user activities
// @route   GET /api/user-activity/:userId
// @access  Private/Admin
const getUserActivities = async (req, res) => {
  try {
    const activities = await UserActivity.find({ user: req.params.userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all user activities
// @route   GET /api/user-activity
// @access  Private/Admin
const getAllActivities = async (req, res) => {
  try {
    const activities = await UserActivity.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 activities
    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get activity statistics
// @route   GET /api/user-activity/stats
// @access  Private/Admin
const getActivityStats = async (req, res) => {
  try {
    const stats = await UserActivity.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { logActivity, getUserActivities, getAllActivities, getActivityStats };
