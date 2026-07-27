import User from '../models/User.js';
import mongoose from 'mongoose';
import {
  ALLOWED_SIGNUP_ROLES,
  comparePassword,
  hashPassword,
  sanitizeUser,
  signToken,
} from '../utils/auth.js';
import {
  addFallbackUser,
  findFallbackUserByEmail,
  emailExistsInFallback,
} from '../utils/fallbackData.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRole = ALLOWED_SIGNUP_ROLES.includes(role) ? role : 'participant';

    const existingMongo = await User.findOne({ email: normalizedEmail }).catch(() => null);
    if (existingMongo || emailExistsInFallback(normalizedEmail)) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    let user = null;
    try {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
      });
    } catch (createError) {
      if (mongoose.connection.readyState !== 1) {
        user = await addFallbackUser({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: userRole,
        });
      } else {
        throw createError;
      }
    }

    const token = signToken({ id: user._id.toString(), role: user.role });

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail }).catch(() => null);

    if (!user) {
      const fallbackUser = findFallbackUserByEmail(normalizedEmail);
      if (!fallbackUser) {
        return res.status(404).json({
          message: 'No account found with this email. Please sign up first.',
          code: 'USER_NOT_FOUND',
        });
      }
      user = fallbackUser;
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: user._id.toString(), role: user.role });

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, company, location, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (company !== undefined) updates.company = company;
    if (location !== undefined) updates.location = location;
    if (avatar !== undefined) updates.avatar = avatar;

    let user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password').catch(() => null);

    if (!user) {
      return res.status(400).json({ message: 'Profile update requires MongoDB connection' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
