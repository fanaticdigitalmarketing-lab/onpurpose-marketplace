const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is required. Run: npm run generate:secrets');
  process.exit(1);
}
if (!REFRESH_TOKEN_SECRET) {
  console.error('FATAL: REFRESH_TOKEN_SECRET is required.');
  process.exit(1);
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const SENSITIVE_FIELDS = [
  'password', 'refreshTokenHash', 'verifyToken', 'verifyTokenExpiry',
  'resetToken', 'resetTokenExpiry'
];

let _User = null;
const init = (UserModel) => { _User = UserModel; };
const getUser = () => {
  if (!_User) throw new Error('auth.init(User) must be called before using auth middleware');
  return _User;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'access') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }
    const User = getUser();
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: SENSITIVE_FIELDS }
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'access') {
      const User = getUser();
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: SENSITIVE_FIELDS }
      });
      if (user && !user.isSuspended) {
        req.user = user;
        req.userId = user.id;
      }
    }
    next();
  } catch (_) { next(); }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    if (decoded.type !== 'refresh') return null;
    const User = getUser();
    const tokenHash = hashToken(refreshToken);
    const user = await User.findOne({ where: { id: decoded.userId, refreshTokenHash: tokenHash } });
    return user ? decoded.userId : null;
  } catch (_) { return null; }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = {
  init,
  authenticate,
  optionalAuth,
  generateTokens,
  verifyRefreshToken,
  requireRole,
  hashToken,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  SENSITIVE_FIELDS
};
