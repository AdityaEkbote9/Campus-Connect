import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { CollaborationRequest } from "../models/CollaborationRequest.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { ProjectSession } from "../models/ProjectSession.js";
import { User } from "../models/User.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { createNotification } from "../utils/notifications.js";
import { REQUEST_STATUSES, canTransitionRequest } from "../utils/requestLifecycle.js";

const router = express.Router();

const assertMember = (session, userId) =>
  session.memberIds.some((memberId) => memberId.toString() === userId.toString());

router.get("/", requireAuth, async (req, res) => {
  const sessions = await ProjectSession.find({ memberIds: req.user._id })
    .populate({
      path: "requestId",
      populate: [
        { path: "senderId", select: "name avatar department year semester" },
        { path: "receiverId", select: "name avatar department year semester" }
      ]
    })
    .sort({ updatedAt: -1 });

  return successResponse(res, { sessions });
});

router.get("/:sessionId", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.sessionId)) {
    return errorResponse(res, 400, "Invalid session id.");
  }

  const session = await ProjectSession.findById(req.params.sessionId).populate({
    path: "requestId",
    populate: [
      { path: "senderId", select: "name avatar department year semester skills badges" },
      { path: "receiverId", select: "name avatar department year semester skills badges" }
    ]
  });

  if (!session) {
    return errorResponse(res, 404, "Project session not found.");
  }

  if (!assertMember(session, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this project.");
  }

  const conversation = await Conversation.findOne({ projectSessionId: session._id });

  await Message.updateMany(
    {
      projectSessionId: session._id,
      senderId: { $ne: req.user._id },
      readBy: { $ne: req.user._id }
    },
    { $addToSet: { readBy: req.user._id } }
  );

  const messages = await Message.find({ projectSessionId: session._id })
    .populate("senderId", "name avatar")
    .sort({ createdAt: 1 });

  return successResponse(res, { session, messages, conversation });
});

router.post("/:sessionId/messages", requireAuth, async (req, res) => {
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
  const type = typeof req.body.type === "string" ? req.body.type.trim() : "text";
  const session = await ProjectSession.findById(req.params.sessionId);

  if (!session) {
    return errorResponse(res, 404, "Project session not found.");
  }

  if (!assertMember(session, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this project.");
  }

  if (!["text", "link", "resource"].includes(type)) {
    return errorResponse(res, 400, "Message type is invalid.");
  }

  if (session.status !== "active") {
    return errorResponse(res, 400, "Chat is only available for active projects.");
  }

  if (!content) {
    return errorResponse(res, 400, "Message content is required.");
  }

  const conversation = await Conversation.findOne({ projectSessionId: session._id });
  if (!conversation) {
    return errorResponse(res, 404, "Conversation not found for this project.");
  }

  const message = await Message.create({
    conversationId: conversation._id,
    projectSessionId: session._id,
    senderId: req.user._id,
    content,
    type,
    readBy: [req.user._id]
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  const otherMembers = session.memberIds.filter(
    (memberId) => memberId.toString() !== req.user._id.toString()
  );
  await Promise.all(
    otherMembers.map((userId) =>
      createNotification({
        userId,
        type: "new_message",
        title: "New message",
        body: `${req.user.name} sent a message in "${session.title || session.requestId?.projectTitle || "Project Room"}".`,
        link: `/sessions/${session._id}`
      })
    )
  );

  const populated = await message.populate("senderId", "name avatar");
  return successResponse(res, { message: populated }, 201);
});

router.patch("/:sessionId", requireAuth, async (req, res) => {
  const session = await ProjectSession.findById(req.params.sessionId);

  if (!session) {
    return errorResponse(res, 404, "Project session not found.");
  }

  if (!assertMember(session, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this project.");
  }

  const allowedStatus = ["active", "paused", "completed", "cancelled"];
  const title = typeof req.body.title === "string" ? req.body.title.trim() : session.title;
  const description =
    typeof req.body.description === "string" ? req.body.description.trim() : session.description;
  const timeline =
    typeof req.body.timeline === "string" ? req.body.timeline.trim() : session.timeline;
  const status = typeof req.body.status === "string" ? req.body.status.trim() : session.status;
  const sharedResources = Array.isArray(req.body.sharedResources)
    ? req.body.sharedResources
        .map((item) => ({
          label: typeof item.label === "string" ? item.label.trim() : "",
          url: typeof item.url === "string" ? item.url.trim() : ""
        }))
        .filter((item) => item.label && item.url)
    : session.sharedResources;
  const milestones = Array.isArray(req.body.milestones)
    ? req.body.milestones
        .map((item) => ({
          title: typeof item.title === "string" ? item.title.trim() : "",
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          isCompleted: Boolean(item.isCompleted)
        }))
        .filter((item) => item.title)
    : session.milestones;

  if (!allowedStatus.includes(status)) {
    return errorResponse(res, 400, "Invalid project status.");
  }

  session.title = title;
  session.description = description;
  session.timeline = timeline;
  session.status = status;
  session.sharedResources = sharedResources;
  session.milestones = milestones;
  await session.save();

  return successResponse(res, { session });
});

router.patch("/:sessionId/complete", requireAuth, async (req, res) => {
  const session = await ProjectSession.findById(req.params.sessionId);

  if (!session) {
    return errorResponse(res, 404, "Project session not found.");
  }

  if (!assertMember(session, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this project.");
  }

  if (session.status === "completed") {
    return errorResponse(res, 400, "This project is already marked complete.");
  }

  if (session.status === "cancelled") {
    return errorResponse(res, 400, "Cancelled projects cannot be completed.");
  }

  const request = await CollaborationRequest.findById(session.requestId);
  if (!request) {
    return errorResponse(res, 404, "Linked request not found for this session.");
  }

  if (!canTransitionRequest(request.status, REQUEST_STATUSES.COMPLETED)) {
    return errorResponse(
      res,
      400,
      `Request cannot move from ${request.status} to ${REQUEST_STATUSES.COMPLETED}.`
    );
  }

  session.status = "completed";
  session.completedAt = new Date();
  await session.save();
  request.status = REQUEST_STATUSES.COMPLETED;
  request.statusHistory.push({ status: REQUEST_STATUSES.COMPLETED, changedAt: new Date() });
  await request.save();

  await Promise.all(
    session.memberIds.map(async (memberId) => {
      await User.findByIdAndUpdate(memberId, { $inc: { completedProjectsCount: 1 } });
      if (memberId.toString() !== req.user._id.toString()) {
        await createNotification({
          userId: memberId,
          type: "project_completed",
          title: "Project completed",
          body: `"${session.title || request.projectTitle}" is ready for review.`,
          link: `/sessions/${session._id}`
        });
      }
    })
  );

  return successResponse(res, { session, request });
});

export default router;
