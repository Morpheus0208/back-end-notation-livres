const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signupUser = (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      return user.save();
    })
    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
    .catch(error => {
      console.error('Erreur Mongoose:', error); // ⬅️ Log de l’erreur
      res.status(400).json({ error });
    });
};

exports.loginUser = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'identifiant/mot de passe incorrect !' });
      }
      return bcrypt.compare(req.body.password, user.password).then(valid => {
        if (!valid) {
          return res.status(401).json({ error: 'identifiant/mot de passe incorrect !' });
        }
        return res.status(200).json({
          userId: user._id,
          token: jwt.sign(
            { userId: user._id },
            'RANDOM_TOKEN_SECRET', // Remplacer par une clé secrète réelle
            { expiresIn: '24h' }
          ),
        });
      });
    })
    .catch(error => res.status(500).json({ error }));
};
