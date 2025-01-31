const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true },
  usedBy: [{ type: String }], // Store userId as strings
});

module.exports = mongoose.model('Coupon', couponSchema);
