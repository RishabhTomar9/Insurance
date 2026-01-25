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
        type: String, // 'Comprehensive' (First Party), 'Third Party Liability' (Third Party)
        required: true,
        enum: ['Comprehensive', 'Third Party Liability', 'Zero Depreciation', 'Own Damage']
    },
    premiumAmount: {
        type: Number,
        required: true,
    },
    policyDuration: {
        type: String,
        required: true,
    },
    policyStartDate: { type: Date, default: Date.now },
    policyEndDate: { type: Date }, // Should be calculated based on duration
    coverageDetails: { type: String }, // Optional notes on specific coverage inclusions
    employeeId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
