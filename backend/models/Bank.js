const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
        // user-defined name for quick access
    }
}, {
    timestamps: true
});

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;
