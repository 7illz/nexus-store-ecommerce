const Order = require('../models/orderModel');
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
      // NEW REQUIREMENT: Check if the user has purchased and received this product
      const hasBoughtAndDelivered = await Order.findOne({
        user: req.user._id,
        isDelivered: true,
        'orderItems.product': product._id
      });

      if (!hasBoughtAndDelivered) {
        return res.status(403).json({ message: 'You can only review products that have been delivered to you.' });
      }
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
const createProduct = async (req, res) => {
  try {
    let finalImageUrl = 'https://via.placeholder.com/400';

    // 1. Check if Multer/Cloudinary processed a physical file
    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    } 
    // 2. Otherwise, check if a text URL was provided
    else if (req.body.image) {
      finalImageUrl = req.body.image;
    }

    const newProduct = new Product({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      countInStock: req.body.countInStock,
      description: req.body.description,
      image: finalImageUrl, 
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.brand = req.body.brand || product.brand;
      product.category = req.body.category || product.category;
      product.price = req.body.price || product.price;
      product.countInStock = req.body.countInStock || product.countInStock;
      product.description = req.body.description || product.description;

      // Handle the hybrid image logic
      if (req.file && req.file.path) {
        product.image = req.file.path; // New physical file
      } else if (req.body.image) {
        product.image = req.body.image; // New text URL
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Export all the functions so our routes can use them
// 👇 CRITICAL: Add updateProduct to your exports!
module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  deleteProduct,
  updateProduct // <-- ADD THIS
};