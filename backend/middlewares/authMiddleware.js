import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || (req.headers?.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    req.user = user;
    next();
  } catch (err) {
    console.error('requireAuth error', err);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

// attachUser: non-fatal middleware that attaches req.user when a valid token is present
export const attachUser = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || (req.headers?.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return next();

    req.user = user;
    return next();
  } catch (err) {
    // If token invalid/expired, silently continue without attaching user
    return next();
  }
};

export default requireAuth;
