const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('🔐 Headers reçus :', req.headers);
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Remplacer par une clé secrète réelle
    const { userId } = decodedToken;
    req.auth = { userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Requête non authentifiée !' });
  }
};
