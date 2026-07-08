const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true // Forces codes like "summer20" to become "SUMMER20"
  },
  discountPercentage: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 100 // Can't discount more than 100%
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    required: true, 
    default: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);