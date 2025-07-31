const bcrypt = require('bcryptjs');
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
    .catch(error => res.status(400).json({ error }));
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
          token: 'TOKEN', // TOKEN a remplacer par un vrai token JWT
        });
      });
    })
    .catch(error => res.status(500).json({ error }));
};
