const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');

// Get all cars for the logged in employee
router.get('/', authMiddleware, async (req, res) => {
    try {
        const cars = await Car.find({ employeeId: req.user.uid });
        res.send(cars);
    } catch (error) {
        res.status(500).send('Error fetching cars');
    }
});

// Create a new car
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newCar = new Car({
            ...req.body,
            employeeId: req.user.uid,
        });
        await newCar.save();
        res.status(201).send(newCar);
    } catch (error) {
        res.status(500).send('Error creating car');
    }
});

// Update a car
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const car = await Car.findOneAndUpdate({ _id: req.params.id, employeeId: req.user.uid }, req.body, { new: true });
        if (!car) {
            return res.status(404).send('Car not found');
        }
        res.send(car);
    } catch (error) {
        res.status(500).send('Error updating car');
    }
});

// Delete a car
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const car = await Car.findOneAndDelete({ _id: req.params.id, employeeId: req.user.uid });
        if (!car) {
            return res.status(404).send('Car not found');
        }
        res.send({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting car');
    }
});

module.exports = router;
