const Message = require('../models/message.model');
const User = require('../models/user');
const Chat = require('../models/chat.model');

// 1️⃣ NAYA MESSAGE BHEJNA
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  var newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId,
  };

  try {
    // Message database me create karo
    let message = await Message.create(newMessage);

    // Message kisne bheja uski profile details lao
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username email avatar",
    });

    // 🔥 SABSE ZAROORI: Chat model me 'latestMessage' update karo
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: "Failed to send message", error: error.message });
  }
};

// 2️⃣ KISI CHAT KE SAARE MESSAGES FETCH KARNA
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username email avatar")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch messages", error: error.message });
  }
};
// ... (Tumhare purane sendMessage aur allMessages functions yahan honge)

// 🔥 NEW: DELETE MESSAGE (ONLY ADMIN CAN DO THIS)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId).populate("chat");
    if (!message) return res.status(404).json({ message: "Message not found" });

    const chat = await Chat.findById(message.chat._id);
    
    // Check if user is Main Admin OR Co-Admin
    const isMainAdmin = chat.groupAdmin.toString() === req.user.id;
    const isCoAdmin = chat.coAdmins.some(adminId => adminId.toString() === req.user.id);
    const isAdmin = isMainAdmin || isCoAdmin;

    if (!isAdmin) {
      return res.status(403).json({ message: "Action Denied! Only admins can delete messages." });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ message: "Message deleted successfully", messageId: req.params.messageId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages, deleteMessage }; // 👈 export add karo