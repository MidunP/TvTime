const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { username, password, displayName } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Username and password are required');
  }

  const existing = await User.findOne({ username: username.toLowerCase().trim() });
  if (existing) {
    res.status(409);
    throw new Error('Username already taken');
  }

  const user = await User.create({
    username: username.toLowerCase().trim(),
    passwordHash: password,
    displayName: displayName || username,
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    user: user.toJSON(),
    accessToken,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Username and password are required');
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    user: user.toJSON(),
    accessToken,
  });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error('No refresh token');
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, refresh, logout, getMe };
