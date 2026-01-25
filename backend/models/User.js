const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        enum: ['manager', 'employee'],
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
    },
    passwordChanged: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Deleted'],
        default: 'Active',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    tempPassword: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
