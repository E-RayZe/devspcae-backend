const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Message kisne bheja
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    // Message ka text kya hai
    content: { 
      type: String, 
      trim: true 
    },
    // Yeh message kis chat room/DM ka hissa hai
    chat: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Chat' 
    },
    // Message seen/read karne ka feature (Optional but cool)
    readBy: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }
    ],
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Message', messageSchema);