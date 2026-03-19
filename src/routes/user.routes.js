// devspace-backend/src/routes/user.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');

// 🔥 SAARE CONTROLLERS EK SATH IMPORT KIYE
const { 
  searchUsers,
  saveWakatimeKey, 
  getWakatimeStats, 
  saveGithubUsername, 
  getGithubStats,
  disconnectWakatime, 
  disconnectGithub,
  getMe,
  getWakatimeProjects,
  getGithubRepos,
  toggleFollow,
  getUserProfile,
  getFollowers,
  getFollowing
} = require('../controllers/user.controller');

// ==========================================
// 🚀 STATIC ROUTES (Ye hamesha DYNAMIC se UPAR hone chahiye)
// ==========================================
router.get('/me', protect, getMe);
router.get('/search', protect, searchUsers);

// ⏱️ WAKATIME ROUTES
router.post('/wakatime/key', protect, saveWakatimeKey);
router.get('/wakatime/stats', protect, getWakatimeStats);
router.get('/wakatime/projects', protect, getWakatimeProjects);
router.delete('/wakatime/disconnect', protect, disconnectWakatime);

// 🐙 GITHUB ROUTES
router.post('/github/username', protect, saveGithubUsername);
router.get('/github/stats', protect, getGithubStats);
router.get('/github/repos', protect, getGithubRepos);
router.delete('/github/disconnect', protect, disconnectGithub);

// ==========================================
// 🧩 DYNAMIC ROUTES (Jisme :id aata hai, wo hamesha NEECHE hone chahiye)
// ==========================================
router.post('/follow/:id', protect, toggleFollow);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.get('/:id', protect, getUserProfile); // 👈 YEH SABSE LAST ME HOGA

module.exports = router;