const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { accessChat, fetchChats, deleteChat } = require('../controllers/chat.controller');
const { createGroupChat } = require('../controllers/chat.controller');
// 1-on-1 chat access karna ya nayi banana
router.post('/', protect, accessChat);

// Apni saari chats dekhna (Inbox)
router.get('/', protect, fetchChats);

// Chat delete karna
router.delete('/:chatId', protect, deleteChat);

//new group create
router.post('/group', protect, createGroupChat);

module.exports = router;