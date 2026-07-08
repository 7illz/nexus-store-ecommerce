const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProductReview,
  createProduct // 👇 1. Import the new function here
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware'); 

// 👇 2. Chain the .post() method to the root route
router.route('/')
  .get(getProducts)
  .post(createProduct); 

router.route('/:id').get(getProductById);

// Protected route
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;