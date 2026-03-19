const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { accessChat, fetchChats, deleteChat, createGroupChat, setTrackedProject, getGroupProjectStats, getChatById, updateCoAdmin } = require('../controllers/chat.controller');

router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.delete('/:chatId', protect, deleteChat);
router.post('/group', protect, createGroupChat);

router.put('/track', protect, setTrackedProject); 
router.get('/stats/:chatId', protect, getGroupProjectStats); 
router.get('/:chatId', protect, getChatById);
router.put('/coadmin', protect, updateCoAdmin); // 👈 NAYA ROUTE ADD KIYA

module.exports = router;