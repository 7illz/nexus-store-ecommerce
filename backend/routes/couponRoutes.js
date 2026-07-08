const express = require('express');
const router = express.Router();
const { applyCoupon, setupTestCoupon } = require('../controllers/couponController');

router.post('/apply', applyCoupon);
router.get('/setup', setupTestCoupon); // We will use this to generate our first coupon!

module.exports = router;