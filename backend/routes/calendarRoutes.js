import express from 'express';
import {
  getAllCalendars,
  getUserCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  deleteCalendar,
} from '../controllers/calendarController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllCalendars);
router.get('/:id', getCalendarById);

// Authenticated
router.get('/user/list', requireAuth, getUserCalendars);
router.post('/', requireAuth, createCalendar);
router.put('/:id', requireAuth, updateCalendar);
router.delete('/:id', requireAuth, deleteCalendar);

export default router;
