import Calendar from '../models/Calendar.js';

// Get all calendars (public)
export const getAllCalendars = async (req, res) => {
  try {
    const calendars = await Calendar.find().populate('createdBy', 'email');
    res.status(200).json(calendars);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get calendars for authenticated user
export const getUserCalendars = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const calendars = await Calendar.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(calendars);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single calendar by id
export const getCalendarById = async (req, res) => {
  try {
    const { id } = req.params;
    const cal = await Calendar.findById(id).populate('createdBy', 'email');
    if (!cal) return res.status(404).json({ message: 'Calendar not found' });
    res.status(200).json(cal);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create calendar (authenticated)
export const createCalendar = async (req, res) => {
  try {
    const { name, description, color, visibility, startDate } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const calendar = new Calendar({
      name: name.trim(),
      description: description || '',
      color: color || '#ec4899',
      visibility: visibility || 'private',
      startDate: startDate ? new Date(startDate) : undefined,
      createdBy: req.user ? req.user._id : undefined,
    });

    await calendar.save();
    res.status(201).json({ message: 'Calendar created', calendar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update calendar (owner)
export const updateCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const cal = await Calendar.findById(id);
    if (!cal) return res.status(404).json({ message: 'Calendar not found' });
    if (req.user && cal.createdBy && cal.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(cal, req.body);
    await cal.save();
    res.status(200).json({ message: 'Calendar updated', calendar: cal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete calendar (owner)
export const deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const cal = await Calendar.findById(id);
    if (!cal) return res.status(404).json({ message: 'Calendar not found' });
    if (req.user && cal.createdBy && cal.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Use model-level delete to avoid depending on document instance methods
    const result = await Calendar.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(500).json({ message: 'Failed to delete calendar' });
    }
    res.status(200).json({ message: 'Calendar deleted' });
  } catch (err) {
    console.error('deleteCalendar error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default {
  getAllCalendars,
  getUserCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  deleteCalendar,
};
