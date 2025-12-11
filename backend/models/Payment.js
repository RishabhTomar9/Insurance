const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  type: { type: String, enum: ['toInsurer','toAgent','fromCustomer','other'], required: true },
  referenceType: { type: String, enum: ['Policy','Quotation','DailyEntry','Other'] },
  referenceId: Schema.Types.ObjectId,
  payeeName: String, // company/agent
  amount: Number,
  vehicleNo: String, // denormalized for quick lookup
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['Link','GI','Cash','Card','BankTransfer','Other'] },
  paymentAccount: String,
  accountNo: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Payment', PaymentSchema);