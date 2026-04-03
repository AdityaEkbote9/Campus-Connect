import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { CollaborationRequest } from "../models/CollaborationRequest.js";
import { Conversation } from "../models/Conversation.js";
import { ProjectSession } from "../models/ProjectSession.js";
import { User } from "../models/User.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { createNotification } from "../utils/notifications.js";
import { REQUEST_STATUSES, canTransitionRequest } from "../utils/requestLifecycle.js";

const router = express.Router();

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const sanitizeList = (value) =>
  Array.isArray(value)
    ? [...new Set(value.map((item) => sanitizeText(item)).filter(Boolean))]
    : [];

router.get("/", requireAuth, async (req, res) => {
  const [incoming, outgoing] = await Promise.all([
    CollaborationRequest.find({ receiverId: req.user._id })
      .populate("senderId", "name avatar department year skills reputationScore badges")
      .sort({ createdAt: -1 }),
    CollaborationRequest.find({ senderId: req.user._id })
      .populate("receiverId", "name avatar department year skills reputationScore badges")
      .sort({ createdAt: -1 })
  ]);

  return successResponse(res, { incoming, outgoing });
});

router.post("/", requireAuth, async (req, res) => {
  const receiverId = req.body.receiverId;
  const projectTitle = sanitizeText(req.body.projectTitle);
  const description = sanitizeText(req.body.description);
  const requiredSkills = sanitizeList(req.body.requiredSkills);
  const requiredRole = sanitizeText(req.body.requiredRole);
  const projectType = sanitizeText(req.body.projectType);
  const customMessage = sanitizeText(req.body.customMessage);
  const urgency = sanitizeText(req.body.urgency) || "medium";
  const expectedDuration = sanitizeText(req.body.expectedDuration);
  const deadline = req.body.deadline ? new Date(req.body.deadline) : null;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return errorResponse(res, 400, "Valid receiverId is required.");
  }

  if (projectTitle.length < 4) {
    return errorResponse(res, 400, "Project title must be at least 4 characters long.");
  }

  if (description.length < 20) {
    return errorResponse(res, 400, "Project description must be at least 20 characters long.");
  }

  if (!["low", "medium", "high"].includes(urgency)) {
    return errorResponse(res, 400, "Urgency must be low, medium, or high.");
  }

  if (deadline && Number.isNaN(deadline.getTime())) {
    return errorResponse(res, 400, "Deadline is invalid.");
  }

  if (receiverId === req.user._id.toString()) {
    return errorResponse(res, 400, "You cannot send a request to yourself.");
  }

  if (!req.user.completedProfile) {
    return errorResponse(res, 400, "Complete your profile before sending requests.");
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || !receiver.completedProfile) {
    return errorResponse(res, 404, "Receiver profile was not found.");
  }

  const existingRequest = await CollaborationRequest.findOne({
    senderId: req.user._id,
    receiverId,
    projectTitle,
    status: {
      $in: [REQUEST_STATUSES.PENDING, REQUEST_STATUSES.MAYBE_LATER, REQUEST_STATUSES.ACCEPTED]
    }
  });

  if (existingRequest) {
    return errorResponse(res, 409, "An active request for this project already exists.");
  }

  const request = await CollaborationRequest.create({
    senderId: req.user._id,
    receiverId,
    projectTitle,
    description,
    requiredSkills,
    requiredRole,
    projectType,
    customMessage,
    urgency,
    expectedDuration,
    deadline,
    statusHistory: [{ status: REQUEST_STATUSES.PENDING, changedAt: new Date() }]
  });

  await createNotification({
    userId: receiverId,
    type: "request_received",
    title: "New collaboration request",
    body: `${req.user.name} invited you to join "${projectTitle}".`,
    link: "/requests"
  });

  const populated = await request.populate("receiverId", "name avatar department year skills");
  return successResponse(res, { request: populated }, 201);
});

router.patch("/:requestId/status", requireAuth, async (req, res) => {
  const status = sanitizeText(req.body.status);

  if (
    ![
      REQUEST_STATUSES.ACCEPTED,
      REQUEST_STATUSES.CANCELLED,
      REQUEST_STATUSES.MAYBE_LATER
    ].includes(status)
  ) {
    return errorResponse(res, 400, "Unsupported request status.");
  }

  const request = await CollaborationRequest.findById(req.params.requestId);
  if (!request) {
    return errorResponse(res, 404, "Request not found.");
  }

  const isReceiver = request.receiverId.toString() === req.user._id.toString();
  const isSender = request.senderId.toString() === req.user._id.toString();

  if (!isReceiver && !isSender) {
    return errorResponse(res, 403, "You cannot update this request.");
  }

  if ([REQUEST_STATUSES.ACCEPTED, REQUEST_STATUSES.MAYBE_LATER].includes(status) && !isReceiver) {
    return errorResponse(res, 403, "Only the receiver can update the request to this status.");
  }

  if (!canTransitionRequest(request.status, status)) {
    return errorResponse(res, 400, `Request cannot move from ${request.status} to ${status}.`);
  }

  request.status = status;
  request.statusHistory.push({ status, changedAt: new Date() });
  await request.save();

  let projectSession = null;
  let conversation = null;

  if (status === REQUEST_STATUSES.ACCEPTED) {
    projectSession = await ProjectSession.findOneAndUpdate(
      { requestId: request._id },
      {
        requestId: request._id,
        memberIds: [request.senderId, request.receiverId],
        title: request.projectTitle,
        description: request.description,
        timeline: request.expectedDuration,
        status: "active",
        startedAt: new Date()
      },
      { upsert: true, new: true }
    );

    conversation = await Conversation.findOneAndUpdate(
      { requestId: request._id },
      {
        requestId: request._id,
        projectSessionId: projectSession._id,
        memberIds: [request.senderId, request.receiverId],
        lastMessageAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

  if (status === REQUEST_STATUSES.CANCELLED) {
    projectSession = await ProjectSession.findOneAndUpdate(
      { requestId: request._id },
      { status: "cancelled" },
      { new: true }
    );
  }

  const notificationMap = {
    [REQUEST_STATUSES.ACCEPTED]: {
      type: "request_accepted",
      title: "Request accepted",
      body: `"${request.projectTitle}" has been accepted.`
    },
    [REQUEST_STATUSES.CANCELLED]: {
      type: "request_cancelled",
      title: "Request updated",
      body: `"${request.projectTitle}" was cancelled.`
    },
    [REQUEST_STATUSES.MAYBE_LATER]: {
      type: "request_maybe_later",
      title: "Request deferred",
      body: `"${request.projectTitle}" was marked maybe later.`
    }
  };

  const targetUserId =
    req.user._id.toString() === request.senderId.toString() ? request.receiverId : request.senderId;

  await createNotification({
    userId: targetUserId,
    ...notificationMap[status],
    link: "/requests"
  });

  return successResponse(res, { request, projectSession, conversation });
});

export default router;
