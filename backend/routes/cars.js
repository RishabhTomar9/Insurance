const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');

// Get all cars (Manager view all, Employee view own)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }
        const cars = await Car.find(query);
        res.send(cars);
    } catch (error) {
        res.status(500).send('Error fetching cars');
    }
});

// Create a new car
router.post('/', authMiddleware, async (req, res) => {
    try {
        const carData = { ...req.body };
        if (req.user.role === 'manager' && req.body.employeeId) {
            carData.employeeId = req.body.employeeId;
        } else {
            carData.employeeId = req.user.uid;
        }

        const newCar = new Car(carData);
        await newCar.save();
        res.status(201).send(newCar);
    } catch (error) {
        res.status(500).send('Error creating car');
    }
});

// Update a car
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }

        // Prevent modification of unique identifiers
        const updates = { ...req.body };
        delete updates.chassisNumber;
        delete updates.engineNumber;

        // Prevent employees from changing ownership
        if (req.user.role !== 'manager') {
            delete updates.employeeId;
        }

        const car = await Car.findOneAndUpdate(query, updates, { new: true });
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
        let query = { _id: req.params.id };
        if (req.user.role !== 'manager') {
            query.employeeId = req.user.uid;
        }
        const car = await Car.findOneAndDelete(query);
        if (!car) {
            return res.status(404).send('Car not found');
        }
        res.send({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting car');
    }
});

module.exports = router;
