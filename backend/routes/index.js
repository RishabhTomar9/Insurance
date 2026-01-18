const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', (req, res) => {
  res.send('Welcome to the Insurance CRM API');
});

const authRoutes = require('./auth');
router.use('/auth', authRoutes);

// Protected routes
router.use('/api', authMiddleware);

const managerRoutes = require('./manager');
const employeeRoutes = require('./employee');

const User = require('../models/User');

const checkRole = (role) => (req, res, next) => {
    if (req.user.role === role) {
        return next();
    }
    return res.status(403).send('Forbidden');
};

router.get('/api/users', authMiddleware, checkRole('manager'), async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' });
        res.send(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

router.get('/api/users/:uid', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (req.user.role !== 'manager' && req.user.uid !== user.uid) {
            return res.status(403).send('Forbidden');
        }
        res.send(user);
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
});


const carRoutes = require('./cars');
const ownerRoutes = require('./owners');
const policyRoutes = require('./policies');

router.use('/api/cars', authMiddleware, carRoutes);
router.use('/api/owners', authMiddleware, ownerRoutes);
router.use('/api/policies', authMiddleware, policyRoutes);

router.use('/api/manager', authMiddleware, checkRole('manager'), managerRoutes);
router.use('/api/employee', authMiddleware, checkRole('employee'), employeeRoutes);


router.put('/api/users/:uid', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (req.user.role !== 'manager' && req.user.uid !== user.uid) {
            return res.status(403).send('Forbidden');
        }
        const updatedUser = await User.findOneAndUpdate({ uid: req.params.uid }, req.body, { new: true });
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send('Error updating user');
    }
});

module.exports = router;