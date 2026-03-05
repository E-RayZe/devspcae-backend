const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['knowledge', 'bug', 'suggestion', 'showcase'],

      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    githubUrl: {
      type: String,
      default: null,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    // 🔐 VERY IMPORTANT: link card to user
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('Card', cardSchema);
