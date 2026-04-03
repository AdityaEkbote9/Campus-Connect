import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String, default: "" },
    username: { type: String, default: "", trim: true, lowercase: true },
    collegeName: { type: String, default: "", trim: true },
    githubUsername: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    year: { type: String, default: "", trim: true },
    semester: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true, maxlength: 500 },
    skills: { type: [String], default: [] },
    preferredProjectTypes: { type: [String], default: [] },
    links: { type: [String], default: [] },
    preferredCollaborationMode: {
      type: String,
      enum: ["online", "offline", "hybrid", ""],
      default: "hybrid"
    },
    availability: { type: String, default: "", trim: true },
    reputationScore: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    completedProjectsCount: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    profileCompletionScore: { type: Number, default: 0 },
    completedProfile: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index({ skills: 1 });
userSchema.index({ preferredProjectTypes: 1 });
userSchema.index({ reputationScore: -1, reviewCount: -1 });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ collegeName: 1, department: 1, year: 1 });
userSchema.index({ preferredCollaborationMode: 1, profileCompletionScore: -1 });

export const User = mongoose.model("User", userSchema);
