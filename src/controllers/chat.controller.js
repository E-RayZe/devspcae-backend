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

const axios = require('axios');

// ==========================================
// 🛠️ SET TRACKED PROJECT FOR A MEMBER
// ==========================================
// ... (Purane functions: accessChat, fetchChats, deleteChat, createGroupChat wahi rahenge)


// ==========================================
// 🛠️ SET TRACKED PROJECTS (MULTIPLE)
// ==========================================
const setTrackedProject = async (req, res) => {
  const { chatId, wakatimeProjects, githubRepos } = req.body; // Arrays aayenge

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const existingIndex = chat.trackedProjects.findIndex(p => p.user.toString() === req.user.id);

    if (existingIndex !== -1) {
      // Overwrite with new edited arrays
      chat.trackedProjects[existingIndex].wakatimeProjects = wakatimeProjects || [];
      chat.trackedProjects[existingIndex].githubRepos = githubRepos || [];
    } else {
      // Create new entry
      chat.trackedProjects.push({ user: req.user.id, wakatimeProjects, githubRepos });
    }

    await chat.save();
    res.status(200).json({ message: "Workspace settings updated!" });
  } catch (error) {
    res.status(500).json({ message: "Error setting tracked project", error: error.message });
  }
};

// ==========================================
// 👑 GET WORKSPACE STATS (ADMIN VIEWS ALL, MEMBER VIEWS OWN)
// ==========================================
const getGroupProjectStats = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate({
      path: 'trackedProjects.user',
      select: 'username githubUsername wakatimeApiKey'
    });

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const isAdmin = chat.groupAdmin && chat.groupAdmin.toString() === req.user.id;
    
    // Agar admin hai to sabka data fetch hoga, normal member hai to sirf uska apna data fetch hoga
    let projectsToProcess = chat.trackedProjects;
    if (!isAdmin) {
      projectsToProcess = chat.trackedProjects.filter(p => p.user._id.toString() === req.user.id);
    }

    const memberStats = [];

    await Promise.all(projectsToProcess.map(async (project) => {
      const userObj = project.user;
      const wakaStatsArr = [];
      const gitStatsArr = [];

      // 1. Fetch individual WakaTime folder stats
      if (userObj.wakatimeApiKey && project.wakatimeProjects && project.wakatimeProjects.length > 0) {
        const base64Key = Buffer.from(userObj.wakatimeApiKey).toString('base64');
        
        for (let folder of project.wakatimeProjects) {
          try {
            const wakaRes = await axios.get(
              `https://wakatime.com/api/v1/users/current/stats/last_7_days?project=${folder}`,
              { headers: { Authorization: `Basic ${base64Key}` } }
            );
            wakaStatsArr.push({
              name: folder,
              total_time: wakaRes.data.data.human_readable_total || "0 secs",
              daily_avg: wakaRes.data.data.human_readable_daily_average || "0 secs",
              top_lang: wakaRes.data.data.languages.length > 0 ? wakaRes.data.data.languages[0].name : "N/A"
            });
          } catch (err) { console.log(`Waka Error for ${folder}`); }
        }
      }

      // 2. Fetch individual GitHub repo stats
      if (userObj.githubUsername && project.githubRepos && project.githubRepos.length > 0) {
        for (let repo of project.githubRepos) {
          try {
            const gitRes = await axios.get(`https://api.github.com/repos/${userObj.githubUsername}/${repo}/commits?per_page=3`);
            gitStatsArr.push({
              name: repo,
              commits: gitRes.data.map(commit => ({
                message: commit.commit.message,
                date: new Date(commit.commit.author.date).toLocaleDateString()
              }))
            });
          } catch (err) { console.log(`Git Error for ${repo}`); }
        }
      }

      memberStats.push({
        user: { id: userObj._id, username: userObj.username },
        rawSettings: { wakatimeProjects: project.wakatimeProjects, githubRepos: project.githubRepos },
        wakatimeStats: wakaStatsArr,
        githubStats: gitStatsArr
      });
    }));

    res.status(200).json({ isAdmin, currentUserId: req.user.id, memberStats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// ... (Purane saare functions yahan upar rahenge) ...

// ==========================================
// ℹ️ GET CHAT DETAILS BY ID (For Group Info Screen)
// ==========================================
// ... (Purane functions wahi rahenge) ...

// ℹ️ GET CHAT DETAILS (Updated to populate coAdmins)
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("users", "username email avatar")
      .populate("groupAdmin", "username email")
      .populate("coAdmins", "username email"); // 🔥 Populate coAdmins
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 🔥 NEW: ASSIGN OR REMOVE CO-ADMIN
const updateCoAdmin = async (req, res) => {
  const { chatId, userId, action } = req.body; // action: 'add' or 'remove'
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Sirf Main Admin kisi aur ko admin bana sakta hai
    if (chat.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the main Admin can do this." });
    }

    if (action === 'add') {
      if (!chat.coAdmins.includes(userId)) chat.coAdmins.push(userId);
    } else {
      chat.coAdmins = chat.coAdmins.filter(id => id.toString() !== userId);
    }

    await chat.save();
    const updatedChat = await Chat.findById(chatId)
      .populate("users", "username email")
      .populate("groupAdmin", "username")
      .populate("coAdmins", "username");
      
    res.status(200).json(updatedChat);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { 
  accessChat, fetchChats, deleteChat, createGroupChat, 
  setTrackedProject, getGroupProjectStats, getChatById, updateCoAdmin // 👈 Export added
};