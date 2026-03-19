const express = require('express');
const { sendMessage, allMessages, deleteMessage } = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/:messageId').delete(protect, deleteMessage); // 👈 NAYA ROUTE

module.exports = router;