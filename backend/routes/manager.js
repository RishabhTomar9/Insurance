const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

router.post('/employee', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Missing name or email');
    }

    const specialChar = '@';
    const randomNumber = Math.floor(Math.random() * 1000);
    const employeeId = `${name.split(' ')[0]}${specialChar}${randomNumber}`;
    const defaultPassword = uuidv4();

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: defaultPassword,
            displayName: name,
        });

        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'employee' });

        const newUser = new User({
            uid: userRecord.uid,
            name,
            email,
            employeeId,
            role: 'employee',
            passwordChanged: false,
            tempPassword: defaultPassword,
        });
        await newUser.save();

        res.status(201).send({
            message: 'Employee created successfully',
            employeeId,
            defaultPassword,
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).send('Error creating employee');
    }
});

router.post('/employee/disable', async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).send('Missing uid');
    }

    try {
        await admin.auth().updateUser(uid, {
            disabled: true,
        });

        await User.findOneAndUpdate({ uid }, { disabled: true });

        res.status(200).send({ message: 'Employee disabled successfully' });
    } catch (error) {
        console.error('Error disabling employee:', error);
        res.status(500).send('Error disabling employee');
    }
});

router.post('/employee/update', async (req, res) => {
    const { uid, name, email } = req.body;

    if (!uid || !name || !email) {
        return res.status(400).send('Missing uid, name, or email');
    }

    try {
        await admin.auth().updateUser(uid, {
            displayName: name,
            email: email
        });

        await User.findOneAndUpdate({ uid }, { name, email });

        res.status(200).send({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).send('Error updating employee');
    }
});

router.delete('/employee/:uid', async (req, res) => {
    const { uid } = req.params;

    if (!uid) {
        return res.status(400).send('Missing uid');
    }

    try {
        // Hard delete from Firebase
        await admin.auth().deleteUser(uid);

        // Hard delete from MongoDB
        await User.findOneAndDelete({ uid });

        res.status(200).send({ message: 'Employee deleted permanently' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('Error deleting employee');
    }
});

module.exports = router;