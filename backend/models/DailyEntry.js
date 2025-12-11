const mongoose = require('mongoose');
const { Schema } = mongoose;

const DailyEntrySchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now, index: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
  agent: { type: Schema.Types.ObjectId, ref: 'User' },
  contactPerson: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('DailyEntry', DailyEntrySchema);