const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function normEmail(v) {
  return (v || '').trim().toLowerCase();
}
function normPwd(v) {
  return (v || '').trim();
}

exports.signupUser = async (req, res, next) => {
  try {
    const email = normEmail(req.body.email);
    const password = normPwd(req.body.password);
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hash,
    });
    return res.status(201).json({ message: 'Utilisateur créé !' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return next(err); // Propagation de l'erreur
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const email = normEmail(req.body.email);
    const password = normPwd(req.body.password);
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'identifiant/mot de passe incorrect !' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'identifiant/mot de passe incorrect !' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Configuration JWT manquante (JWT_SECRET)' });

    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      expiresIn: '24h',
      algorithm: 'HS256',
    });
    return res.status(200).json({ userId: user._id, token });
  } catch (err) {
    return next(err);
  }
};
