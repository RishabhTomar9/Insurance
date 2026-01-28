const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
    },
    chassisNumber: {
        type: String,
        required: true,
    },
    engineNumber: {
        type: String,
        required: true,
        immutable: true // Mongoose immutable property
    },
    chassisNumber: {
        type: String,
        required: true,
        immutable: true
    },
    make: { type: String, required: true },
    model: { type: String, required: true },
    manufacturingYear: { type: Number, required: true },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], required: true },
    registrationDate: { type: Date, required: true },
    previousOwners: [{
        name: String,
        phone: String,
        period: String
    }],
    currentInsuranceStatus: { // To track if it has valid insurance
        type: String,
        enum: ['Active', 'Expired', 'None'],
        default: 'None'
    },
    employeeId: {
        type: String,
        required: true,
    },
    cc: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Private', 'Commercial'],
        required: true
    },
    agentDetails: {
        name: { type: String },
        mobile: { type: String },
        email: { type: String }
    }
}, {
    timestamps: true,
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
