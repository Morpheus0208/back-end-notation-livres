const mongoose = require('mongoose');

// Schéma pour les notes des livres
// Utilisation d'un sous-document pour les notes, avec un index sur userId pour améliorer les performances des requêtes
const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { _id: false } // Pas besoin d'un ID pour les sous-documents
);
// Schéma pour les livres
// Ajout d'un index sur userId pour améliorer les performances des requêtes
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
  ratings: {
    type: [ratingSchema],
    default: [],
  },
  averageRating: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  },
});

// Méthode pour recalculer la note moyenne
bookSchema.methods.recomputeAverage = function recomputeAverage() {
  if (!this.ratings.length) {
    this.averageRating = 0;
    return this.averageRating;
  }
  const sum = this.ratings.reduce((acc, r) => acc + r.grade, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10; // 1 décimale
  return this.averageRating;
};

module.exports = mongoose.model('Book', bookSchema);
