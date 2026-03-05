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

module.exports = { sendMessage, allMessages };