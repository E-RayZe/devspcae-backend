const Card = require('../models/Card');

// CREATE CARD
// devspace-backend/src/controllers/card.controller.js

const createCard = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    
    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // 🔥 Agar image upload hui hai, toh Cloudinary uska URL req.file.path me dega
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path; 
    }

    // Agar frontend se tags string me aa rahe hain toh unhe array me convert karo
    let parsedTags = [];
    if (req.body.tags) {
      parsedTags = JSON.parse(req.body.tags);
    }

    const card = await Card.create({
      title,
      description,
      type,
      tags: parsedTags,
      imageUrl, // 👈 Image URL save ho gaya!
      createdBy: req.user.id,
    });

    res.status(201).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create card' });
  }
};
// ... baaki methods same rahenge

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

// ✅ UPDATE CARD FUNCTION
const updateCard = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    let card = await Card.findById(req.params.id);

    if (!card) return res.status(404).json({ message: 'Card not found' });
    
    // Check if user is the owner
    if (card.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to edit this card' });
    }

    // Update Text Fields
    if (title) card.title = title;
    if (description) card.description = description;
    if (type) card.type = type;

    // Update Tags (agar bheje hain)
    if (req.body.tags) {
      card.tags = JSON.parse(req.body.tags);
    }

    // 🔥 Update Image (agar user ne edit karte waqt nayi photo dali hai)
    if (req.file) {
      card.imageUrl = req.file.path; 
    }

    await card.save();
    res.status(200).json(card);
  } catch (error) {
    console.error("Update Error:", error);
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

// ✅ GET SINGLE CARD BY ID

// ✅ GET SINGLE CARD BY ID
const getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).populate('createdBy', 'username email');
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.status(200).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch card' });
  }
};
// devspace-backend/src/controllers/card.controller.js me add karo

// ✅ GET CARDS ONLY FROM FOLLOWING USERS
const getHomeFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    // Unhi ke cards laao jinki ID following array me hai
    const cards = await Card.find({ createdBy: { $in: currentUser.following } })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 }); // Latest upar
      
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch home feed' });
  }
};
// ✅ GET CARDS BY SPECIFIC USER ID
const getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ createdBy: req.params.userId })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 }); // Latest posts sabse upar
    res.status(200).json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user cards' });
  }
};


module.exports = { createCard, getAllCards, getMyCards, updateCard, deleteCard, getCardById, getHomeFeed,getUserCards };

