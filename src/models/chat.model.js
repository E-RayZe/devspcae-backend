const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: { 
      type: String, 
      trim: true 
    },
    isGroupChat: { 
      type: Boolean, 
      default: false 
    },
    // Kon kon users is chat me hain (DM me 2, Group me zyada)
    users: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }
    ],
    // UI me bahar sabse latest message dikhane ke liye
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    // Agar project room/group hai, toh uska admin kon hai
    groupAdmin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Chat', chatSchema);