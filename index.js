const app = require('./src/app');
const Card = require('./src/models/Card'); 
const PORT = process.env.PORT || 5000;

// Database connection logic agar tumne alag file me rakha hai, toh yahan ya app.js me require kar lena
const connectDB = require('./src/config/db');
connectDB();

const server = app.listen(PORT, () => {
  console.log('Card model loaded:', Card ? Card.modelName : 'Card');
  console.log(`🚀 Server running on port ${PORT}`);
});

// ==========================================
// 🔥 SOCKET.IO REAL-TIME CHAT SETUP
// ==========================================
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", 
  },
});

io.on("connection", (socket) => {
  console.log("⚡ New User Connected to Socket.io");

  // User ka personal room
  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
      socket.emit("connected");
    }
  });

  // Chat/Project room join karna
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // Typing Indicators
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Real-time messages bhejna
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat || !chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      // Khud ko wapas notification nahi bhejna
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // Disconnect logic
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});