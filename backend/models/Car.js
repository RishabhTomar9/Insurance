const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
        uppercase: true
    },
    chassisNumber: {
        type: String,
        required: true,
        // immutable: true // Mongoose immutable property logic is often complex with updates, keeping simple for now or enforcing in controller
    },
    engineNumber: {
        type: String,
        required: true
    },
    make: { type: String, required: true }, // Brand (Maruti Suzuki)
    model: { type: String, required: true }, // Product (Alto 800)
    variant: { type: String },
    manufacturingYear: { type: Number, required: true },
    registrationYear: { type: Number, required: true },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
        required: true
    },
    registrationDate: { type: Date },
    cc: { type: Number, required: true },
    category: {
        type: String,
        enum: ['Personal', 'Commercial'],
        required: true
    },
    previousOwners: [{
        name: String,
        phone: String,
        period: String
    }],
    currentInsuranceStatus: {
        type: String,
        enum: ['Active', 'Expired', 'None'],
        default: 'None'
    },
    employeeId: {
        type: String,
        required: true,
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
