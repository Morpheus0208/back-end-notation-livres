const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true, // Index pour améliorer les performances des requêtes
  },
  title: {
    type: String,
    required: true,
    trim: true, // Supprimer les espaces inutiles
  },
  author: {
    type: String,
    required: true,
    trim: true, // Supprimer les espaces inutiles
  },
  imageUrl: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true, // Supprimer les espaces inutiles
  },
  ratings: [
    {
      userId: {
        type: String,
        required: true,
      },
      grade: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model('Book', bookSchema);
