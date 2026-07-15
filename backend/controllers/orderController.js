const Order = require('../models/orderModel');
const sendEmail = require('../utils/sendEmail');

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
      isPaid: true, // Dummy payment confirmation
      paidAt: Date.now(),
    });

    // Save to MongoDB
    const createdOrder = await order.save();
    
    // Send email notification using Ethereal
    const emailHtml = `
      <h1>Thank you for your order!</h1>
      <p>Your dummy payment was successful and your order has been received.</p>
      <p><strong>Order ID:</strong> ${createdOrder._id}</p>
      <p><strong>Total:</strong> $${createdOrder.totalPrice.toFixed(2)}</p>
      <hr />
      <h3>Order Items:</h3>
      <ul>
        ${createdOrder.orderItems.map(item => `<li>${item.qty}x ${item.name} - $${(item.price * item.qty).toFixed(2)}</li>`).join('')}
      </ul>
      <p>We will notify you when it ships.</p>
    `;

    try {
      await sendEmail({
        email: req.user.email,
        subject: `Order Confirmation ${createdOrder._id}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email', emailError);
    }

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

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Owner
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching all orders', error: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Owner
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating order status', error: error.message });
  }
};

module.exports = { addOrderItems, getMyOrders, getAllOrders, updateOrderToDelivered };