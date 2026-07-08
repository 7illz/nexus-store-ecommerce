const Order = require('../models/orderModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Requires Token)
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice } = req.body;

    // Check if there are actually items in the order
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Create a new order attached to the logged-in user
    const order = new Order({
      orderItems,
      user: req.user._id, // This comes from our authMiddleware!
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Save to MongoDB
    const createdOrder = await order.save();
    
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error saving order', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Requires Token)
const getMyOrders = async (req, res) => {
  try {
    // Find all orders where the user ID matches the logged-in user's ID
    // .sort({ createdAt: -1 }) ensures the newest orders appear at the top!
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching orders', error: error.message });
  }
};

module.exports = { addOrderItems, getMyOrders };