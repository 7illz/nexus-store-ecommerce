const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module for generating random strings

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (Email/Password)
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user (Email/Password)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Register an Owner/Admin
const registerOwner = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: 'Invalid Admin Secret Code' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'owner' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during owner registration', error: error.message });
  }
};

// @desc    Google Login / Registration
const googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    // 1. Fetch user profile from Google using the access token
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const googleUser = await googleResponse.json();

    if (!googleUser.email) {
      return res.status(400).json({ message: 'Failed to retrieve email from Google' });
    }

    // 2. Check if user already exists in our database
    let user = await User.findOne({ email: googleUser.email });

    // 3. If they don't exist, create an account for them
    if (!user) {
      // Generate a secure 32-character random password since they use Google to log in
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        password: randomPassword, 
      });
    }

    // 4. Send back the same JWT standard response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Google Login Error: ", error);
    res.status(500).json({ message: 'Server Error during Google Login', error: error.message });
  }
};

module.exports = { registerUser, loginUser, registerOwner, googleLogin };