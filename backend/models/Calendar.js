import mongoose from 'mongoose';

const CalendarSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#ec4899' },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  startDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Calendar', CalendarSchema);
