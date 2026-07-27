import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { findFallbackUserById } from '../utils/fallbackData.js';
import { sanitizeUser } from '../utils/auth.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'hackverse-super-secret';

const loadUser = async (id) => {
  let user = await User.findById(id).select('-password').catch(() => null);
  if (!user) {
    user = findFallbackUserById(id);
    if (user) {
      const { password, ...safe } = user;
      return safe;
    }
  }
  return user;
};

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized — please log in' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await loadUser(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized — user not found' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized — invalid or expired token' });
  }
};

export const optionalProtect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await loadUser(decoded.id);
    }
  } catch {
    req.user = null;
  }
  next();
};

export const attachSanitizedUser = (req, res, next) => {
  if (req.user) {
    req.user = sanitizeUser(req.user);
  }
  next();
};
