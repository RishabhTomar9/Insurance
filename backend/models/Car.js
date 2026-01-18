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
    },
    employeeId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
