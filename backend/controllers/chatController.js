const ChatSession = require('../models/chatModel');

const getAllChatSessions = async (req, res) => {
  try {
    // Fetch all sessions and populate the user details so admin knows who they are talking to
    const sessions = await ChatSession.find()
      .populate('user', 'name email')
      .sort({ lastUpdated: -1 }); // Newest active chats first
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ message: 'Server error fetching chats' });
  }
};

module.exports = { getAllChatSessions };