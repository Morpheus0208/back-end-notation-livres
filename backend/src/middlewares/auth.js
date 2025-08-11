const jwt = require('jsonwebtoken');

function extractBearerToken(header) {
  if (!header || typeof header !== 'string') return null; // Autoriser "Bearer <token>" avec variations d'espaces / casse
  const [scheme, ...rest] = header.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== 'bearer') return null;
  const token = rest.join(' ');
  return token && token !== 'null' && token !== 'undefined' ? token : null;
}
module.exports = (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res
        .status(401)
        .json({ error: 'Token manquant ou mal formé (utilisez "Authorization: Bearer <token>")' });
    }
    const secret = process.env.JWT_SECRET; //  JWT_SECRET est défini dans environnement
    if (!secret) {
      return res.status(500).json({ error: 'Configuration JWT manquante (JWT_SECRET)' });
    }

    const decodedToken = jwt.verify(token, secret, { algorithms: ['HS256'], clockTolerance: 5 });
    const { userId } = decodedToken;
    if (!userId) {
      return res.status(401).json({ error: 'Token invalide (userId manquant)' });
    }
    req.auth = { userId };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    return res.status(401).json({ error: 'Requête non authentifiée' });
  }
};
