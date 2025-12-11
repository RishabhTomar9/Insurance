const mongoose = require('mongoose');
const { Schema } = mongoose;

const OwnerSchema = new Schema({
  name: { type: String, required: true, index: true },
  address: String,
  mobile: String,
  email: String,
  aadharNumber: String,
  drivingLicence: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  meta: Schema.Types.Mixed
});

module.exports = mongoose.model('Owner', OwnerSchema);