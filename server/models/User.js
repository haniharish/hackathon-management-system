import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'organizer', 'participant', 'judge'], default: 'participant' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    bookmarkedHackathons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
