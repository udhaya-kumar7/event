import express from 'express';
import rateLimit from 'express-rate-limit';
import { requestReset, resetPassword, signup, login, me, refresh, logout } from '../controllers/authController.js';

const router = express.Router();

// Rate limiters
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again later.' },
});

router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/refresh', refresh);

// Password reset (rate-limited)
router.post('/request-reset', resetLimiter, requestReset);
router.post('/reset-password', resetPassword);

export default router;
