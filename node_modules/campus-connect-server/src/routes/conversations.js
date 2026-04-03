import express from "express";
import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

const router = express.Router();

const isParticipant = (conversation, userId) =>
  conversation.memberIds.some((memberId) => memberId.toString() === userId.toString());

router.get("/", requireAuth, async (req, res) => {
  const conversations = await Conversation.find({ memberIds: req.user._id })
    .populate({
      path: "requestId",
      populate: [
        { path: "senderId", select: "name avatar" },
        { path: "receiverId", select: "name avatar" }
      ]
    })
    .populate("projectSessionId", "status title")
    .sort({ lastMessageAt: -1 });

  const conversationIds = conversations.map((conversation) => conversation._id);
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        conversationId: { $in: conversationIds },
        senderId: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      }
    },
    { $group: { _id: "$conversationId", count: { $sum: 1 } } }
  ]);

  const unreadMap = new Map(unreadCounts.map((item) => [item._id.toString(), item.count]));

  return successResponse(res, {
    conversations: conversations.map((conversation) => ({
      ...conversation.toObject(),
      unreadCount: unreadMap.get(conversation._id.toString()) ?? 0
    }))
  });
});

router.get("/:conversationId/messages", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
    return errorResponse(res, 400, "Invalid conversation id.");
  }

  const conversation = await Conversation.findById(req.params.conversationId)
    .populate({
      path: "requestId",
      populate: [
        { path: "senderId", select: "name avatar" },
        { path: "receiverId", select: "name avatar" }
      ]
    })
    .populate("projectSessionId", "status title");

  if (!conversation) {
    return errorResponse(res, 404, "Conversation not found.");
  }

  if (!isParticipant(conversation, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this conversation.");
  }

  await Message.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: req.user._id },
      readBy: { $ne: req.user._id }
    },
    { $addToSet: { readBy: req.user._id } }
  );

  const messages = await Message.find({ conversationId: conversation._id })
    .populate("senderId", "name avatar")
    .sort({ createdAt: 1 });

  return successResponse(res, { conversation, messages });
});

router.patch("/:conversationId/read", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
    return errorResponse(res, 400, "Invalid conversation id.");
  }

  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) {
    return errorResponse(res, 404, "Conversation not found.");
  }

  if (!isParticipant(conversation, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this conversation.");
  }

  await Message.updateMany(
    { conversationId: conversation._id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  return successResponse(res, { success: true });
});

router.patch("/:conversationId/messages/:messageId/pin", requireAuth, async (req, res) => {
  if (
    !mongoose.Types.ObjectId.isValid(req.params.conversationId) ||
    !mongoose.Types.ObjectId.isValid(req.params.messageId)
  ) {
    return errorResponse(res, 400, "Invalid conversation or message id.");
  }

  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) {
    return errorResponse(res, 404, "Conversation not found.");
  }

  if (!isParticipant(conversation, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this conversation.");
  }

  const message = await Message.findOne({
    _id: req.params.messageId,
    conversationId: conversation._id
  });
  if (!message) {
    return errorResponse(res, 404, "Message not found.");
  }

  message.isPinned = !message.isPinned;
  await message.save();

  return successResponse(res, { message });
});

export default router;
