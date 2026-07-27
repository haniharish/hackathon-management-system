import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

registrationSchema.index({ hackathon: 1, user: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
