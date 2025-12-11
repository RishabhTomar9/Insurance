const mongoose = require('mongoose');
const { Schema } = mongoose;

const PolicySchema = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
  insurer: String, // e.g., PolicyBazaar or specific insurer
  policyNumber: String,
  insuredAmount: Number,
  thirdPartyAmount: Number,
  insurancePremium: Number,
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Policy', PolicySchema);