import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    projectSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectSession", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["text", "link", "resource"], default: "text" },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    isPinned: { type: Boolean, default: false },
    readBy: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

messageSchema.index({ projectSessionId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
