/**
 * MERN Stack - Backend Entry Point (server.js)
 * * In a full project, you would split these into separate folders:
 * /models, /controllers, /routes, and /middleware. 
 * For this boilerplate, they are combined to give you a complete overview.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // Ensure dotenv is loaded to read .env file

const ChatSession = require('./models/chatModel');


// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Near the top


// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origins
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

/* ==========================================
   API ROUTES (MVC Integrated)
========================================== */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// A simple test route
app.get('/api', (req, res) => {
  res.json({ message: "E-commerce API is running cleanly!" });
});

/* ==========================================
   SOCKET.IO LIVE SUPPORT CHAT
========================================== */
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // Customer joins their own chat room using their userId
  socket.on('join_chat', async (userId) => {
    if (!userId) return;

    socket.join(userId);
    console.log(`User ${userId} joined their chat room`);
    
    // Fetch or create their chat session
    let session = await ChatSession.findOne({ user: userId });
    if (!session) {
      session = new ChatSession({ user: userId, messages: [] });
      await session.save();
    }
    // Send previous messages to user
    socket.emit('chat_history', session.messages);
  });

  // Admin joins the global admin room to receive all notifications
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('Admin joined admin_room');
  });

  // Customer sends a message
  socket.on('send_message', async ({ userId, text }) => {
    if (!userId) return;

    try {
      let session = await ChatSession.findOne({ user: userId });
      if (!session) {
        session = new ChatSession({ user: userId, messages: [] });
      }
      
      const newMessage = { sender: 'customer', text };
      session.messages.push(newMessage);
      session.lastUpdated = Date.now();
      await session.save();

      // Emit to themselves (so their own UI updates)
      io.to(userId).emit('receive_message', newMessage);
      
      // Emit to admin room
      io.to('admin_room').emit('new_admin_message', { userId, message: newMessage });
    } catch (error) {
      console.log("Socket message error:", error);
    }
  });

  // Admin replies to a specific customer
  socket.on('admin_reply', async ({ userId, text }) => {
    try {
      let session = await ChatSession.findOne({ user: userId });
      if (session) {
        const newMessage = { sender: 'admin', text };
        session.messages.push(newMessage);
        session.lastUpdated = Date.now();
        await session.save();

        // Emit to the specific user's room
        io.to(userId).emit('receive_message', newMessage);
        // Also emit back to admin so their UI updates
        io.to('admin_room').emit('new_admin_message', { userId, message: newMessage });
      }
    } catch (error) {
      console.log("Admin reply error:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

/* ==========================================
   START SERVER
========================================== */
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));