const Product = require('../models/productModel');

// @desc    Fetch all products (Includes Search, Filter, and Sort logic)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category, sort } = req.query;

    // 1. Search Query Logic (Case-insensitive regex)
    const searchQuery = keyword
      ? { name: { $regex: keyword, $options: 'i' } }
      : {};

    // 2. Category Filter Logic
    const categoryQuery = category
      ? { category }
      : {};

    // 3. Sorting Logic
    let sortQuery = {};
    if (sort === 'lowest') {
      sortQuery = { price: 1 }; // 1 for Ascending (Low to High)
    } else if (sort === 'highest') {
      sortQuery = { price: -1 }; // -1 for Descending (High to Low)
    } else {
      sortQuery = { createdAt: -1 }; // Default: Newest first
    }

    // Combine queries and fetch from database
    const products = await Product.find({ ...searchQuery, ...categoryQuery }).sort(sortQuery);
    
    // Fetch a list of all unique categories so our frontend dropdown populates automatically
    const categories = await Product.distinct('category');

    res.json({ products, categories });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching products', error: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching product', error: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private (Logged in users only)
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      // Prevent spam: Check if the user already reviewed this product
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      // Create the review object
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      // Add to array
      product.reviews.push(review);
      
      // Update totals
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

      // Save to database
      await product.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all the functions so our routes can use them
module.exports = { 
  getProducts, 
  getProductById, 
  createProductReview 
};