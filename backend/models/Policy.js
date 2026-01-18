const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
    },
    policyType: {
        type: String,
        required: true,
    },
    premiumAmount: {
        type: Number,
        required: true,
    },
    policyDuration: {
        type: String,
        required: true,
    },
    employeeId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
