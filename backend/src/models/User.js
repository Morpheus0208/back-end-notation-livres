const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Pour capter proprement les erreurs d'unicité
userSchema.post('save', (error, _, next) => {
  if (error.code === 11000) {
    next(new Error('Email déjà utilisé'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
