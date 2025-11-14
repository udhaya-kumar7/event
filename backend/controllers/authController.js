import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

const TOKEN_BYTES = 32; // 32 bytes -> 64 hex chars
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

const signAccessToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in environment');
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

const signRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET or JWT_SECRET is not set in environment');
  return jwt.sign({ sub: user._id }, secret, { expiresIn: REFRESH_TOKEN_EXPIRES });
};

export const requestReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Always respond with generic message to avoid account enumeration
  const genericMsg = 'If an account with that email exists, a password reset link has been sent.';

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json({ message: genericMsg });

    const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = Date.now() + TOKEN_EXPIRY_MS;
    await user.save();

    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const resetLink = `${frontendBase}/reset-password?token=${token}&id=${user._id}`;

    const subject = 'Reset your password';
    const text = `Reset link: ${resetLink}`;
    const html = `<p>Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`;

    const result = await sendEmail({ to: user.email, subject, text, html });

    // If dev mode, return the link so developer can copy it
    if (result && result.devMode) {
      return res.status(200).json({ message: genericMsg, resetLink });
    }

    return res.status(200).json({ message: genericMsg });
  } catch (err) {
    console.error('requestReset error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token, password } = req.body;
  if (!userId || !token || !password) return res.status(400).json({ message: 'Missing required fields' });

  try {
    const user = await User.findById(userId);
    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (tokenHash !== user.resetPasswordTokenHash) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(password, saltRounds);
    user.passwordHash = newHash;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('resetPassword error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const signup = async (req, res) => {
  const { email, password } = req.body || {};
  console.log('signup payload:', req.body);
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email: email.toLowerCase().trim(), passwordHash });

    // Optionally auto-login after signup
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Store refresh token in DB
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({ message: 'User created', user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ message: 'Logged in', user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    // req.user is attached by middleware if available
    if (req.user) return res.status(200).json({ user: { id: req.user._id, email: req.user.email } });

    // Try to read accessToken cookie
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash -resetPasswordTokenHash -resetPasswordExpires');
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    return res.status(200).json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('me error', err);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    // Check token exists in DB
    const found = (user.refreshTokens || []).find(r => r.token === refreshToken);
    if (!found) return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccess = signAccessToken(user);
    res.cookie('accessToken', newAccess, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    return res.status(200).json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('refresh error', err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (user) {
          user.refreshTokens = (user.refreshTokens || []).filter(r => r.token !== refreshToken);
          await user.save();
        }
      } catch (e) {
        // ignore
      }
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { requestReset, resetPassword };
