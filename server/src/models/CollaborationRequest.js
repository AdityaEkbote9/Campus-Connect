import mongoose from "mongoose";

import { REQUEST_STATUSES } from "../utils/requestLifecycle.js";

const collaborationRequestSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    requiredSkills: { type: [String], default: [] },
    requiredRole: { type: String, default: "", trim: true },
    projectType: { type: String, default: "", trim: true },
    customMessage: { type: String, default: "", trim: true, maxlength: 1000 },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    expectedDuration: { type: String, default: "", trim: true },
    deadline: { type: Date, default: null },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          changedAt: { type: Date, default: Date.now }
        }
      ],
      default: [{ status: REQUEST_STATUSES.PENDING, changedAt: new Date() }]
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUSES),
      default: REQUEST_STATUSES.PENDING
    }
  },
  { timestamps: true }
);

collaborationRequestSchema.index({ senderId: 1, receiverId: 1, status: 1 });

export const CollaborationRequest = mongoose.model(
  "CollaborationRequest",
  collaborationRequestSchema
);
