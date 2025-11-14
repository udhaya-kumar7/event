import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  resetPasswordTokenHash: { type: String },
  resetPasswordExpires: { type: Date },
  refreshTokens: [{ token: String, createdAt: Date }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
