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
    // Adding optional fields for flexibility if needed later, but sticking to core requirement
    panCard: { type: String },
    companyName: { type: String }, // For Commercial Owners
    gstNumber: { type: String }
}, {
    timestamps: true,
});

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
