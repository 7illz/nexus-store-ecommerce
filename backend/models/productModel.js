// backend/models/productModel.js
const mongoose = require('mongoose');

// 1. Create the Review Schema first
const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

// 2. Add it into your existing Product Schema
const productSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  name: { type: String, required: true },
  image: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },
  
  // NEW FIELDS FOR REVIEWS:
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);