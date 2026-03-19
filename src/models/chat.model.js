const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    
    // Main Creator
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // 🔥 NEW: Multiple Admins Array
    coAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    
    trackedProjects: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        wakatimeProjects: [{ type: String, trim: true }],
        githubRepos: [{ type: String, trim: true }]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);