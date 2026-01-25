const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
const authMiddleware = require('../middleware/authMiddleware');

// Get all policies (Manager view all, Employee view own)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }
        const policies = await Policy.find(query).populate('carId').populate('ownerId');
        res.send(policies);
    } catch (error) {
        res.status(500).send('Error fetching policies');
    }
});

// Create a new policy
router.post('/', authMiddleware, async (req, res) => {
    try {
        const policyData = { ...req.body };
        if (req.user.role === 'manager' && req.body.employeeId) {
            policyData.employeeId = req.body.employeeId;
        } else {
            policyData.employeeId = req.user.uid;
        }

        const newPolicy = new Policy(policyData);
        await newPolicy.save();
        res.status(201).send(newPolicy);
    } catch (error) {
        res.status(500).send('Error creating policy');
    }
});

// Update a policy
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

        const policy = await Policy.findOneAndUpdate(query, updates, { new: true });
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
        let query = { _id: req.params.id };
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }
        const policy = await Policy.findOneAndDelete(query);
        if (!policy) {
            return res.status(404).send('Policy not found');
        }
        res.send({ message: 'Policy deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting policy');
    }
});

module.exports = router;
