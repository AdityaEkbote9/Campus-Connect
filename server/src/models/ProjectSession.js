import mongoose from "mongoose";

const projectSessionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollaborationRequest",
      required: true,
      unique: true
    },
    memberIds: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    timeline: { type: String, default: "", trim: true },
    assignedRoles: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          role: { type: String, required: true, trim: true }
        }
      ],
      default: []
    },
    sharedResources: {
      type: [
        {
          label: { type: String, required: true, trim: true },
          url: { type: String, required: true, trim: true }
        }
      ],
      default: []
    },
    milestones: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          dueDate: { type: Date, default: null },
          isCompleted: { type: Boolean, default: false }
        }
      ],
      default: []
    },
    status: { type: String, enum: ["active", "paused", "completed", "cancelled"], default: "active" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const ProjectSession = mongoose.model("ProjectSession", projectSessionSchema);
