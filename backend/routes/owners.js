const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');
const authMiddleware = require('../middleware/authMiddleware');

// Get all owners
router.get('/', authMiddleware, async (req, res) => {
    try {
        const owners = await Owner.find({});
        res.send(owners);
    } catch (error) {
        res.status(500).send('Error fetching owners');
    }
});

// Create a new owner
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newOwner = new Owner(req.body);
        await newOwner.save();
        res.status(201).send(newOwner);
    } catch (error) {
        res.status(500).send('Error creating owner');
    }
});

// Update an owner
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!owner) {
            return res.status(404).send('Owner not found');
        }
        res.send(owner);
    } catch (error) {
        res.status(500).send('Error updating owner');
    }
});

// Delete an owner
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const owner = await Owner.findByIdAndDelete(req.params.id);
        if (!owner) {
            return res.status(404).send('Owner not found');
        }
        res.send({ message: 'Owner deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting owner');
    }
});

module.exports = router;
