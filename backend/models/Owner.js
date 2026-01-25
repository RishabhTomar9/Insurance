const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    aadharCard: {
        type: String,
        required: true,
    },
    drivingLicense: {
        type: String,
        required: true,
    },
    employeeId: {
        type: String,
        required: true,
        index: true
    },
}, {
    timestamps: true,
});

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
