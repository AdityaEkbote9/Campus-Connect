import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    projectSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectSession", required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, default: 5 },
    skillQuality: { type: Number, min: 1, max: 5, default: 5 },
    reliability: { type: Number, min: 1, max: 5, default: 5 },
    timeliness: { type: Number, min: 1, max: 5, default: 5 },
    teamwork: { type: Number, min: 1, max: 5, default: 5 },
    flagGhosting: { type: Boolean, default: false },
    comment: { type: String, default: "", trim: true, maxlength: 500 },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

reviewSchema.index({ projectSessionId: 1, reviewerId: 1, revieweeId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
