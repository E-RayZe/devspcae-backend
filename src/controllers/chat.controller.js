const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const User = require('../models/user'); // Ensure user model is correctly imported

// 1️⃣ 1-on-1 Chat Start karna ya Purani Chat Fetch karna
const accessChat = async (req, res) => {
  const { userId } = req.body; // Jiske sath chat karni hai uski ID

  if (!userId) {
    return res.status(400).json({ message: "UserId is required to start a chat" });
  }

  try {
    // Check karo kya in dono ke beech pehle se koi chat hai?
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'username email avatar',
    });

    if (isChat.length > 0) {
      // Agar chat hai, toh wahi return kar do
      res.send(isChat[0]);
    } else {
      // Agar nahi hai, toh nayi chat create karo
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user.id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      res.status(200).send(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: "Error accessing chat", error: error.message });
  }
};

// 2️⃣ Logged-in User ki saari Chats fetch karna (Inbox ke liye)
const fetchChats = async (req, res) => {
  try {
    // Sirf wo chats dhoondo jisme logged-in user (req.user.id) shamil hai
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 }); // Latest chat sabse upar

    results = await User.populate(results, {
      path: 'latestMessage.sender',
      select: 'username email avatar',
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

// 3️⃣ 🔥 CHAT DELETE SYSTEM (Jo tumne manga tha)
const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Pehle is chat ke saare messages database se udao (Storage free karne ke liye)
    await Message.deleteMany({ chat: chatId });

    // Phir main Chat object ko udao
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat and all its messages deleted permanently!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chat", error: error.message });
  }
};

// ==========================================
// 👥 CREATE PROJECT ROOM (GROUP CHAT)
// ==========================================
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  // Frontend se users ki array stringify hoke aayegi
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }

  users.push(req.user.id); // Jisne group banaya, usko bhi add karo

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user.id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { accessChat, fetchChats, deleteChat, createGroupChat };
