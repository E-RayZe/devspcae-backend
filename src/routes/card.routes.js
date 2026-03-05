const express = require('express');
const router = express.Router();

const {
  createCard,
  getAllCards,
  getMyCards,
  updateCard,
  deleteCard,
} = require('../controllers/card.controller');

const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, createCard);
router.get('/', protect, getAllCards);
router.get('/me', protect, getMyCards);

// 🔥 NEW
router.put('/:id', protect, updateCard);
router.delete('/:id', protect, deleteCard);

module.exports = router;
