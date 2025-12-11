const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReceiptSchema = new Schema({
  fromType: { type: String, enum: ['Agent','Owner','Other'] },
  fromName: String,
  amount: Number,
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  date: { type: Date, default: Date.now },
  paymentMethod: String,
  actualAmount: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Receipt', ReceiptSchema);