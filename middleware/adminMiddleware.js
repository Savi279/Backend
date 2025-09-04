import User from '../models/User.js';

const admin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'admin') {
            next(); // User is an admin, proceed
        } else {
            res.status(403).json({ msg: 'Admin resource, access denied' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export default admin;
