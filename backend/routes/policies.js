const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
const authMiddleware = require('../middleware/authMiddleware');

// Get all policies for the logged in employee
router.get('/', authMiddleware, async (req, res) => {
    try {
        const policies = await Policy.find({ employeeId: req.user.uid }).populate('carId').populate('ownerId');
        res.send(policies);
    } catch (error) {
        res.status(500).send('Error fetching policies');
    }
});

// Create a new policy
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newPolicy = new Policy({
            ...req.body,
            employeeId: req.user.uid,
        });
        await newPolicy.save();
        res.status(201).send(newPolicy);
    } catch (error) {
        res.status(500).send('Error creating policy');
    }
});

// Update a policy
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const policy = await Policy.findOneAndUpdate({ _id: req.params.id, employeeId: req.user.uid }, req.body, { new: true });
        if (!policy) {
            return res.status(404).send('Policy not found');
        }
        res.send(policy);
    } catch (error) {
        res.status(500).send('Error updating policy');
    }
});

// Delete a policy
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const policy = await Policy.findOneAndDelete({ _id: req.params.id, employeeId: req.user.uid });
        if (!policy) {
            return res.status(404).send('Policy not found');
        }
        res.send({ message: 'Policy deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting policy');
    }
});

module.exports = router;
