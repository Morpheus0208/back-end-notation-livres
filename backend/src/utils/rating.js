// Calcule la note moyenne d'un tableau de notations.

function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((total, rating) => total + rating.grade, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

module.exports = { calculateAverageRating };
