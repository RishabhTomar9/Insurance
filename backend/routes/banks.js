const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');

// GET all banks
router.get('/', async (req, res) => {
    try {
        const banks = await Bank.find();
        res.json(banks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single bank
router.get('/:id', async (req, res) => {
    try {
        const bank = await Bank.findById(req.params.id);
        if (!bank) return res.status(404).json({ message: 'Bank not found' });
        res.json(bank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create bank
router.post('/', async (req, res) => {
    const bank = new Bank({
        bankName: req.body.bankName,
        branch: req.body.branch,
        accountNumber: req.body.accountNumber,
        ifscCode: req.body.ifscCode,
        accountHolderName: req.body.accountHolderName,
        nickName: req.body.nickName
    });

    try {
        const newBank = await bank.save();
        res.status(201).json(newBank);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE bank
router.put('/:id', async (req, res) => {
    try {
        const bank = await Bank.findById(req.params.id);
        if (!bank) return res.status(404).json({ message: 'Bank not found' });

        if (req.body.bankName) bank.bankName = req.body.bankName;
        if (req.body.branch) bank.branch = req.body.branch;
        if (req.body.accountNumber) bank.accountNumber = req.body.accountNumber;
        if (req.body.ifscCode) bank.ifscCode = req.body.ifscCode;
        if (req.body.accountHolderName) bank.accountHolderName = req.body.accountHolderName;
        if (req.body.nickName) bank.nickName = req.body.nickName;

        const updatedBank = await bank.save();
        res.json(updatedBank);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE bank
router.delete('/:id', async (req, res) => {
    try {
        const bank = await Bank.findById(req.params.id);
        if (!bank) return res.status(404).json({ message: 'Bank not found' });

        await bank.deleteOne();
        res.json({ message: 'Bank deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
