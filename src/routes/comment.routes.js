// devspace-backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const { addComment, getCommentsByCard, deleteComment, verifyComment } = require('../controllers/comment.controller'); // 👈 verifyComment import me add karo
const { protect } = require('../middlewares/auth.middleware');

router.post('/:cardId', protect, addComment);
router.get('/:cardId', protect, getCommentsByCard);
router.delete('/:id', protect, deleteComment);
router.put('/:id/verify', protect, verifyComment);
module.exports = router;