const { verifyAccessToken } = require('../util/jwt');

// Protects API routes: requires a valid Bearer access token.
// Attaches req.user = { sub, kind, phone, role }.
module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (err) {
    // TokenExpiredError vs invalid — client refreshes on 401 either way.
    return res.status(401).json({ message: 'Session expired. Please sign in again.', code: 'TOKEN_INVALID' });
  }
};

// Optional helper: restrict a route to specific principal kinds/roles.
module.exports.requireKind = (...kinds) => (req, res, next) => {
  if (!req.user || !kinds.includes(req.user.kind)) {
    return res.status(403).json({ message: 'Not allowed.' });
  }
  next();
};
