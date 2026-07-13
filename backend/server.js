/**
 * MERN Stack - Backend Entry Point (server.js)
 * * In a full project, you would split these into separate folders:
 * /models, /controllers, /routes, and /middleware. 
 * For this boilerplate, they are combined to give you a complete overview.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Ensure dotenv is loaded to read .env file

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Near the top


// Initialize App
const app = express();
app.use(express.json());
app.use(cors());

// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

/* ==========================================
   API ROUTES (MVC Integrated)
========================================== */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// A simple test route
app.get('/api', (req, res) => {
  res.json({ message: "E-commerce API is running cleanly!" });
});

/* ==========================================
   START SERVER
========================================== */
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));