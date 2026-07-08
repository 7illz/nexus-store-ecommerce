const Coupon = require('../models/couponModel');

// @desc    Verify and apply a coupon
// @route   POST /api/coupons/apply
// @access  Public
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Find coupon in database
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    // 1. Check if it exists
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // 2. Check if it's turned on
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    // 3. Check if it's expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // If everything is good, send back the discount!
    res.json({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    DEVELOPMENT ONLY: Quickly create a test coupon
// @route   GET /api/coupons/setup
const setupTestCoupon = async (req, res) => {
  try {
    // Creates a SUMMER20 coupon valid for the next 30 days
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const coupon = await Coupon.create({
      code: 'SUMMER20',
      discountPercentage: 20,
      expiryDate: nextMonth,
      isActive: true
    });

    res.status(201).json({ message: 'Test coupon SUMMER20 created!', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Coupon already exists or error occurred.' });
  }
};

module.exports = { applyCoupon, setupTestCoupon };