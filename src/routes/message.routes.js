const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { sendMessage, allMessages } = require('../controllers/message.controller');

// Naya message bhejne ke liye POST request
router.post('/', protect, sendMessage);

// Saare messages fetch karne ke liye GET request (chatId URL me aayegi)
router.get('/:chatId', protect, allMessages);

module.exports = router;