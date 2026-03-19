// devspace-backend/src/routes/card.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');

// 👇 getHomeFeed ko bhi import me add kiya
const { 
    createCard, 
    getAllCards, 
    getMyCards, 
    updateCard, 
    deleteCard, 
    getCardById, 
    getHomeFeed,
    getUserCards
} = require('../controllers/card.controller');

// 🔥 FIX: `/feed` aur `/me` hamesha `/:id` se UPAR hone chahiye
router.get('/feed', protect, getHomeFeed); 
router.get('/me', protect, getMyCards);
router.get('/', protect, getAllCards);
router.post('/', protect, upload.single('image'), createCard); 
router.get('/user/:userId', protect, getUserCards);
// 🧩 DYNAMIC ROUTES (Neeche)
router.put('/:id', protect, upload.single('image'), updateCard);
router.delete('/:id', protect, deleteCard);
router.get('/:id', protect, getCardById);

module.exports = router;