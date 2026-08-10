const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/notifications');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, error: 'User already exists' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await User.create({ email, passwordHash, firstName, lastName, emailVerified: true });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.status(201).json({ success: true, accessToken, user });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (user.accountStatus !== 'active') return res.status(403).json({ success: false, error: 'Account suspended/deleted' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, accessToken, user });
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  req.user.refreshToken = refreshToken;
  await req.user.save();
  
  const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${accessToken}`);
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      req.user.fcmToken = null;
      await req.user.save();
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(user.email, 'Password Reset Request', `Click to reset: ${resetUrl}`);

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, error: 'Invalid token' });

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleCallback, refresh, logout, forgotPassword, resetPassword };
