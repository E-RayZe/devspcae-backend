// devspace-backend/src/models/comment.model.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isVerifiedSolution: { type: Boolean, default: false } // Aage chal kar best answer mark karne ke liye
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);