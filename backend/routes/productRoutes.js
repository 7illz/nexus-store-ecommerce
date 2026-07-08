const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProductReview 
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware'); // Your auth middleware

// Public routes (Anyone can view products)
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// Protected route (Only logged-in users can post a review)
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;