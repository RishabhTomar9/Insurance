const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// @route   GET api/vehicles
// @desc    Get all vehicles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('owner').populate('agent');
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vehicles
// @desc    Create a vehicle
// @access  Public
router.post('/', async (req, res) => {
  const {
    vehicleNo,
    chassisNo,
    engineNo,
    yearOfManufacture,
    yearOfRegistration,
    brand,
    product,
    cc,
    category,
    fuelType,
    owner,
    agent,
  } = req.body;

  try {
    const newVehicle = new Vehicle({
      vehicleNo,
      chassisNo,
      engineNo,
      yearOfManufacture,
      yearOfRegistration,
      brand,
      product,
      cc,
      category,
      fuelType,
      owner,
      agent,
    });

    const vehicle = await newVehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
