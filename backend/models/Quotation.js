const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuotationSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  insuredAmount: Number,
  thirdPartyAmount: Number,
  insuranceOfVehicle: Number, // if separate
  insurancePremium: Number,
  actualPaymentAmount: Number,
  isSent: { type: Boolean, default: false },
  sentTo: { type: String }, // email/phone
  pdfUrl: String,
  status: { type: String, enum: ['draft','sent','accepted','rejected'], default: 'draft' }
});
module.exports = mongoose.model('Quotation', QuotationSchema);