const Card = require('../models/Card');

// CREATE CARD
const createCard = async (req, res) => {
  try {
    const { title, description, type, tags, githubUrl, imageUrl } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const card = await Card.create({
      title,
      description,
      type,
      tags,
      githubUrl,
      imageUrl,
      createdBy: req.user.id, // 🔐 from JWT
    });

    res.status(201).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create card' });
  }
};

// ✅ GET ALL CARDS (FEED)
const getAllCards = async (req, res) => {
  try {
    const cards = await Card.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch cards' });
  }
};
// ✅ GET MY CARDS (PROFILE)
const getMyCards = async (req, res) => {
  try {
    const myCards = await Card.find({
      createdBy: req.user.id,
    })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(myCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user cards' });
  }
};

// ✅ UPDATE CARD
const updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // 🔐 Only owner can update
    if (card.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update card' });
  }
};

// ✅ DELETE CARD
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // 🔐 Only owner can delete
    if (card.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await card.deleteOne();
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete card' });
  }
};



module.exports = {
  createCard,
  getAllCards,
  getMyCards,
  updateCard,
  deleteCard,
};
