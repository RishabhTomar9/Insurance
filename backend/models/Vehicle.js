const mongoose = require('mongoose');
const { Schema } = mongoose;

const VehicleSchema = new Schema({
  vehicleNo: { type: String, required: true, unique: true, index: true }, // GJ01RJ2927
  chassisNo: { type: String, index: true },
  engineNo: String,
  yearOfManufacture: Number,
  yearOfRegistration: Number,
  brand: String,
  product: String, // Alto 800 etc.
  cc: Number,
  category: { type: String, enum: ['Personal','Commercial'] },
  fuelType: { type: String, enum: ['Diesel','Petrol','EV','CNG','Hybrid','Other'] },
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
  agent: { type: Schema.Types.ObjectId, ref: 'User' }, // optional agent link
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  meta: Schema.Types.Mixed
});

module.exports = mongoose.model('Vehicle', VehicleSchema);