const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProductReview,
  createProduct,
  deleteProduct,
  updateProduct // 👇 1. Import it
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

router.route('/')
  .get(getProducts)
  .post(upload.single('imageFile'), createProduct); 

// 👇 2. Chain the .delete() method to this route
router.route('/:id')
  .get(getProductById)
  .delete(deleteProduct); 

router.route('/:id')
  .get(getProductById)
  .delete(deleteProduct)
  .put(upload.single('imageFile'), updateProduct);

router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;