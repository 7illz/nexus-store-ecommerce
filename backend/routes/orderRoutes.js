const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getAllOrders, updateOrderToDelivered } = require('../controllers/orderController');
const { protect, protectOwner } = require('../middleware/authMiddleware');

// We put the `protect` middleware first so it verifies the token BEFORE running the controller
router.post('/', protect, addOrderItems);
router.get('/', protect, protectOwner, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.put('/:id/deliver', protect, protectOwner, updateOrderToDelivered);

module.exports = router;