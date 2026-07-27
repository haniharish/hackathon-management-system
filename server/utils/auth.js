import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const getJwtSecret = () => process.env.JWT_SECRET || 'hackverse-super-secret';

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

export const signToken = (payload) => jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const sanitizeUser = (user) => {
  if (!user) return null;
  const id = user._id?.toString?.() || user.id || user._id;
  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    bio: user.bio || '',
    company: user.company || '',
    location: user.location || '',
    isActive: user.isActive !== false,
    emailVerified: Boolean(user.emailVerified),
  };
};

export const ALLOWED_SIGNUP_ROLES = ['participant', 'organizer', 'judge'];
