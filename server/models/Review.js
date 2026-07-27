import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    innovation: { type: Number, default: 0 },
    technicalComplexity: { type: Number, default: 0 },
    uiUx: { type: Number, default: 0 },
    functionality: { type: Number, default: 0 },
    scalability: { type: Number, default: 0 },
    documentation: { type: Number, default: 0 },
    presentation: { type: Number, default: 0 },
    comments: { type: String, default: '' },
    feedback: { type: String, default: '' },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.pre('save', function (next) {
  this.totalScore =
    this.innovation +
    this.technicalComplexity +
    this.uiUx +
    this.functionality +
    this.scalability +
    this.documentation +
    this.presentation;
  next();
});

export default mongoose.model('Review', reviewSchema);
