const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');

// @route   GET api/policies
// @desc    Get all policies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const policies = await Policy.find().populate('vehicle').populate('owner');
    res.json(policies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/policies
// @desc    Create a policy
// @access  Public
router.post('/', async (req, res) => {
  const {
    vehicle,
    owner,
    insurer,
    policyNumber,
    insuredAmount,
    startDate,
    endDate
  } = req.body;

  try {
    const newPolicy = new Policy({
      vehicle,
      owner,
      insurer,
      policyNumber,
      insuredAmount,
      startDate,
      endDate
    });

    const policy = await newPolicy.save();
    res.json(policy);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
