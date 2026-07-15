const express = require('express');
const router = express.Router();
const { getAllChatSessions } = require('../controllers/chatController');
const { protect, protectOwner } = require('../middleware/authMiddleware');

// Get all active chat sessions (Admin Only)
router.get('/sessions', protect, protectOwner, getAllChatSessions);

module.exports = router;