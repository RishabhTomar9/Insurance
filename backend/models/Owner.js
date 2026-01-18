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
}, {
    timestamps: true,
});

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
