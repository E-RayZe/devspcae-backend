// devspace-backend/src/controllers/comment.controller.js
const Comment = require('../models/comment.model');

exports.addComment = async (req, res) => {
  try {
    if (!req.body.content) return res.status(400).json({ message: 'Content required' });

    const comment = await Comment.create({
      content: req.body.content,
      card: req.params.cardId,
      createdBy: req.user.id
    });

    const populatedComment = await comment.populate('createdBy', 'username email');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

exports.getCommentsByCard = async (req, res) => {
  try {
    const comments = await Comment.find({ card: req.params.cardId })
      .populate('createdBy', 'username email')
      .sort({ createdAt: 1 }); // Purane comments upar
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Not found' });

    // Sirf comment ka owner hi use delete kar sakta hai
    if (comment.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// ✅ MARK COMMENT AS VERIFIED SOLUTION (PIN)
exports.verifyComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('card');
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Sirf Card ka owner hi solution mark kar sakta hai
    if (comment.card.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only post author can pin comments' });
    }

    // Toggle the verified status
    comment.isVerifiedSolution = !comment.isVerifiedSolution;
    await comment.save();
    
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying comment' });
  }
};