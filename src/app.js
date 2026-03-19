const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// 🔥 ROUTES IMPORT
// ==========================================
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
// Note: Agar tumhari card routes ki file ka naam kuch aur hai (jaise card.routes.js), toh yahan wahi likhna
const cardRoutes = require('./routes/card.routes'); 
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');
const commentRoutes = require('./routes/comment.routes');
// ==========================================
// 🔥 ROUTES MOUNTING (Paths)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cards', cardRoutes); 
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/comments', commentRoutes);
// Test Route (Check karne ke liye ki API chal rahi hai ya nahi)
app.get('/', (req, res) => {
  res.send('DevSpace API is running smoothly... 🚀');
});

// Agar upar wale kisi route se match nahi hua, toh 404 Error (Yeh sabse last me hona chahiye)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error("🚨 BACKEND UPLOAD ERROR:", err); // Backend terminal me error aayega
  res.status(500).json({ 
    message: "Server File Upload Error", 
    error: err.message || "Unknown Error" 
  });
});

module.exports = app;