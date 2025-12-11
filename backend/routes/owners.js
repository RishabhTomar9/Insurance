const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');

// @route   GET api/owners
// @desc    Get all owners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const owners = await Owner.find();
    res.json(owners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/owners
// @desc    Create an owner
// @access  Public
router.post('/', async (req, res) => {
  const {
    name,
    address,
    mobile,
    email,
    aadharNumber,
    drivingLicence
  } = req.body;

  try {
    const newOwner = new Owner({
      name,
      address,
      mobile,
      email,
      aadharNumber,
      drivingLicence
    });

    const owner = await newOwner.save();
    res.json(owner);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
