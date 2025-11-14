import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to User who created the event
  calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
