import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    theme: { type: String, required: true },
    banner: { type: String, default: '' },
    prizePool: { type: String, required: true },
    venue: { type: String, required: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    isOnline: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },
    assignedJudges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    registrationDeadline: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxTeamSize: { type: Number, default: 4 },
    rules: [{ type: String }],
    judgingCriteria: [{ type: String }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'open', 'closed', 'ongoing', 'completed'], default: 'draft' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Hackathon', hackathonSchema);
