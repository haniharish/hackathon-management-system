import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    problemStatement: { type: String, required: true },
    solution: { type: String, required: true },
    description: { type: String, default: '' },
    githubRepo: { type: String, default: '' },
    liveDemo: { type: String, default: '' },
    techStack: [{ type: String }],
    presentationPdf: { type: String, default: '' },
    screenshots: [{ type: String }],
    demoVideo: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'submitted', 'reviewed', 'winner'], default: 'draft' },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
