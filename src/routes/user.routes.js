const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');

// 🔥 SAARE CONTROLLERS EK SATH IMPORT KIYE (getMe bhi add kar diya)
const { 
  searchUsers,
  saveWakatimeKey, 
  getWakatimeStats, 
  saveGithubUsername, 
  getGithubStats,
  disconnectWakatime, 
  disconnectGithub,
  getMe // 👈 YEH MISSING THA
} = require('../controllers/user.controller'); 

// Purana test route
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    user: req.user,
  });
});

// Search users route (chat start karne ke liye)
router.get('/search', protect, searchUsers);

// ⏱️ WAKATIME ROUTES
router.post('/wakatime/key', protect, saveWakatimeKey);
router.get('/wakatime/stats', protect, getWakatimeStats);

// 🐙 GITHUB ROUTES
router.post('/github/username', protect, saveGithubUsername);
router.get('/github/stats', protect, getGithubStats);

// ❌ NAYE DISCONNECT ROUTES
router.delete('/wakatime/disconnect', protect, disconnectWakatime);
router.delete('/github/disconnect', protect, disconnectGithub);

// 🔥 ME ROUTE
router.get('/me', protect, getMe);

module.exports = router;