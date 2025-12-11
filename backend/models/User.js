const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true},
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['employee','agent','admin'], default: 'employee' },
  phone: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  meta: Schema.Types.Mixed
});

module.exports = mongoose.model('User', UserSchema);