const User = require('../models/user');
const axios = require('axios');

// ==========================================
// ⏱️ WAKATIME INTEGRATION LOGIC
// ==========================================

const saveWakatimeKey = async (req, res) => {
  try {
    const { wakatimeApiKey } = req.body;
    if (!wakatimeApiKey) return res.status(400).json({ message: 'API Key is required' });

    const user = await User.findByIdAndUpdate(req.user.id, { wakatimeApiKey }, { new: true }).select('-password');
    res.status(200).json({ message: 'WakaTime Key saved successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getWakatimeStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.wakatimeApiKey) return res.status(400).json({ message: 'WakaTime API Key not linked yet' });

    const base64Key = Buffer.from(user.wakatimeApiKey).toString('base64');
    const response = await axios.get(
      'https://wakatime.com/api/v1/users/current/stats/last_7_days',
      { headers: { Authorization: `Basic ${base64Key}` } }
    );

    res.status(200).json(response.data.data); // Isme automatically days, editors aur os ka data aa jata hai
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch WakaTime stats.' });
  }
};

// ==========================================
// 🐙 GITHUB INTEGRATION LOGIC
// ==========================================

const saveGithubUsername = async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) return res.status(400).json({ message: 'GitHub Username is required' });

    const user = await User.findByIdAndUpdate(req.user.id, { githubUsername }, { new: true }).select('-password');
    res.status(200).json({ message: 'GitHub connected successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getGithubStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.githubUsername) return res.status(400).json({ message: 'GitHub not linked yet' });

    const username = user.githubUsername;
    
    // 3 API calls ek sath lagayenge (Profile, Repos, aur Recent Events)
    const [profileRes, reposRes, eventsRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`),
      axios.get(`https://api.github.com/users/${username}/events?per_page=10`)
    ]);

    // Total Stars calculate karna (saari public repos ka mila kar)
    const totalStars = reposRes.data.reduce((acc, repo) => acc + repo.stargazers_count, 0);

    // Sirf Push aur Create events filter karna
    const recentActivity = eventsRes.data
      .filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent')
      .slice(0, 3)
      .map(event => ({
        id: event.id,
        type: event.type === 'PushEvent' ? 'Pushed to' : 'Created',
        repo: event.repo.name,
        date: new Date(event.created_at).toLocaleDateString()
      }));

    const githubData = {
      username: profileRes.data.login,
      followers: profileRes.data.followers,
      public_repos: profileRes.data.public_repos,
      total_stars: totalStars,
      avatar_url: profileRes.data.avatar_url,
      recent_repos: reposRes.data.slice(0, 3).map(repo => ({
        name: repo.name,
        url: repo.html_url,
        language: repo.language
      })),
      recent_activity: recentActivity
    };

    res.status(200).json(githubData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch GitHub stats. Check if username is correct.' });
  }
};

// ==========================================
// ❌ DISCONNECT LOGIC (WakaTime & GitHub)
// ==========================================

const disconnectWakatime = async (req, res) => {
  try {
    // Database me key ko wapas null kar denge
    await User.findByIdAndUpdate(req.user.id, { wakatimeApiKey: null });
    res.status(200).json({ message: 'WakaTime disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect WakaTime' });
  }
};

const disconnectGithub = async (req, res) => {
  try {
    // Database me username ko wapas null kar denge
    await User.findByIdAndUpdate(req.user.id, { githubUsername: null });
    res.status(200).json({ message: 'GitHub disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect GitHub' });
  }
};

// ==========================================
// 🔍 SEARCH USERS (For starting a new chat)
// ==========================================
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // Khud ko chhod kar baaki saare matching users return karo
    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user.id } })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to search users" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// module.exports me getMe add karna mat bhoolna!
module.exports = { 
  saveWakatimeKey, 
  getWakatimeStats, 
  saveGithubUsername, 
  getGithubStats,
  disconnectWakatime, 
  disconnectGithub,
  searchUsers,  // 👈 Yeh ensure karo
  getMe         // 👈 Aur yeh ensure karo
};