const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, registerOwner } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin); // <-- New Google Route
router.post('/register-owner', registerOwner);

module.exports = router;