import express from "express";
import Subscription from "../models/Subscription.js"; // <-- import Subscription model
import Event from '../models/Event.js';
import { requireAuth, attachUser } from '../middlewares/authMiddleware.js';
import {
  getAllEvents,
  getUserEvents,
  getMyEvents,
  getEventsByCalendar,
  subscribeEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getSubscriptionStatus, // optional, if used
} from "../controllers/eventController.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get('/calendar/:calendarId', getEventsByCalendar);
router.get("/user-events", getUserEvents); // Get events by specific user (query param)
router.get('/me', requireAuth, getMyEvents);
router.post("/subscribe", attachUser, subscribeEvent);
router.get("/subscription-status", attachUser, getSubscriptionStatus); // optional

// Admin routes
// Protect create so we can set createdBy from req.user
router.post("/", requireAuth, createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

// Check if an email is already subscribed to an event
router.post("/check-subscription", async (req, res) => {
  const { eventId, email } = req.body;
  if (!eventId || !email) return res.status(400).json({ subscribed: false });

  try {
    const subscription = await Subscription.findOne({ eventId, email });
    res.status(200).json({ subscribed: !!subscription });
  } catch (err) {
    res.status(500).json({ subscribed: false, error: err.message });
  }
});

export default router;
