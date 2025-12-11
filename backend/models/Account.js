const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountSchema = new Schema({
  name: String, // "PolicyBazaar" or "Bank - HDFC"
  type: String, // bank/gateway/other
  accountNumber: String,
  meta: Schema.Types.Mixed
});
module.exports = mongoose.model('Account', AccountSchema);