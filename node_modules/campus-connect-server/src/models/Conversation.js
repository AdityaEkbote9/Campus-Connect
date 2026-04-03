import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    memberIds: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollaborationRequest",
      required: true,
      unique: true
    },
    projectSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSession",
      required: true,
      unique: true
    },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

conversationSchema.index({ memberIds: 1, updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
