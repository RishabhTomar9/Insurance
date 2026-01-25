const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');
const authMiddleware = require('../middleware/authMiddleware');

// Get all owners (Manager view all, Employee view own)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }
        const owners = await Owner.find(query);
        res.send(owners);
    } catch (error) {
        res.status(500).send('Error fetching owners');
    }
});

// Create a new owner
router.post('/', authMiddleware, async (req, res) => {
    try {
        const ownerData = { ...req.body };
        // If manager and employeeId provided, use it. Otherwise default to creator
        if (req.user.role === 'manager' && req.body.employeeId) {
            ownerData.employeeId = req.body.employeeId;
        } else {
            ownerData.employeeId = req.user.uid;
        }

        const newOwner = new Owner(ownerData);
        await newOwner.save();
        res.status(201).send(newOwner);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating owner');
    }
});

// Update an owner
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }

        const updates = { ...req.body };
        // Prevent employees from changing ownership
        if (req.user.role !== 'manager') {
            delete updates.employeeId;
        }

        const owner = await Owner.findOneAndUpdate(query, updates, { new: true });
        if (!owner) {
            return res.status(404).send('Owner not found or unauthorized');
        }
        res.send(owner);
    } catch (error) {
        res.status(500).send('Error updating owner');
    }
});

// Delete an owner
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }
        const owner = await Owner.findOneAndDelete(query);
        if (!owner) {
            return res.status(404).send('Owner not found or unauthorized');
        }
        res.send({ message: 'Owner deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting owner');
    }
});

module.exports = router;
