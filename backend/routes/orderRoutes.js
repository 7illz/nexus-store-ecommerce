const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// We put the `protect` middleware first so it verifies the token BEFORE running the controller
router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);

module.exports = router;