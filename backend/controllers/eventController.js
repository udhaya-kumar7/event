import Event from "../models/Event.js";
import Subscription from "../models/Subscription.js";

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get events for a calendar
export const getEventsByCalendar = async (req, res) => {
  try {
    const { calendarId } = req.params;
    if (!calendarId) return res.status(400).json({ message: 'calendarId required' });

    const events = await Event.find({ calendarId }).sort({ date: 1, time: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get events created by a specific user
export const getUserEvents = async (req, res) => {
  try {
    // If caller passed a createdBy query param, use that (backwards compat)
    const queryCreatedBy = req.query?.createdBy;
    if (queryCreatedBy) {
      const events = await Event.find({ createdBy: queryCreatedBy });
      return res.status(200).json(events);
    }

    return res.status(400).json({ message: "createdBy parameter required or use /me endpoint" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// POST subscribe to event
// POST subscribe to event
export const subscribeEvent = async (req, res) => {
  try {
    const { eventId, email } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID required" });
    }

    // if user is authenticated, prefer their account email
    const user = req.user || null;
    const subEmail = user?.email || email;

    if (!subEmail) return res.status(400).json({ message: 'Email required for subscription' });

    // Check if already subscribed by userId or email
  const query = { eventId };
  if (user && user._id) query.userId = user._id;
  else query.email = subEmail;

    const existing = await Subscription.findOne(query);
    if (existing) return res.status(400).json({ message: 'You are already subscribed to this event' });

  const subscription = new Subscription({ eventId, email: subEmail, userId: user && user._id ? user._id : undefined });
    await subscription.save();

    res.status(200).json({ message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get my events: events created by the user OR events they've subscribed to
export const getMyEvents = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const userId = req.user._id;

    // events created by user
    const created = await Event.find({ createdBy: userId });

    // subscriptions for user (by userId or email fallback)
    const subs = await Subscription.find({ $or: [{ userId }, { email: req.user.email }] });
    const subscribedEventIds = subs.map(s => s.eventId.toString());

    const subscribedEvents = subscribedEventIds.length > 0 ? await Event.find({ _id: { $in: subscribedEventIds } }) : [];

    // merge unique events: created first then subscribed non-duplicate
    const eventsMap = new Map();
    created.forEach(e => eventsMap.set(e._id.toString(), e));
    subscribedEvents.forEach(e => {
      if (!eventsMap.has(e._id.toString())) eventsMap.set(e._id.toString(), e);
    });

    const merged = Array.from(eventsMap.values());
    res.status(200).json(merged);
  } catch (err) {
    console.error('getMyEvents error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// --------------------------
// ADMIN EVENT MANAGEMENT 👇
// --------------------------

// Create new event
export const createEvent = async (req, res) => {
  try {
    const { title, date, time, location, category, description, image, calendarId } = req.body;

    if (!title || !date || !time || !location) {
      return res.status(400).json({ message: "Title, date, time, and location are required" });
    }

  // Prefer authenticated user as creator when available
  const creatorId = req.user?._id || req.body?.createdBy;
  const newEvent = new Event({ title, date, time, location, category, description, image, createdBy: creatorId, calendarId });
    await newEvent.save();

    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Check if user already subscribed to an event
export const getSubscriptionStatus = async (req, res) => {
  try {
    const { eventId, email } = req.query;
    if (!eventId) return res.status(400).json({ message: 'eventId required' });

    // If authenticated, check by userId first
    if (req.user && req.user._id) {
      const existsByUser = await Subscription.findOne({ eventId, userId: req.user._id });
      if (existsByUser) return res.status(200).json({ subscribed: true });
    }

    if (!email) return res.status(200).json({ subscribed: false });

    const exists = await Subscription.findOne({ eventId, email });
    res.status(200).json({ subscribed: !!exists });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

