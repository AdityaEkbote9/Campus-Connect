import express from "express";
import mongoose from "mongoose";
import { ProjectSession } from "../models/ProjectSession.js";
import { requireAuth } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

const router = express.Router();

const isMember = (session, userId) =>
  session.memberIds.some((memberId) => memberId.toString() === userId.toString());

router.get("/", requireAuth, async (req, res) => {
  const projects = await ProjectSession.find({ memberIds: req.user._id })
    .populate({
      path: "requestId",
      populate: [
        { path: "senderId", select: "name avatar" },
        { path: "receiverId", select: "name avatar" }
      ]
    })
    .sort({ updatedAt: -1 });

  return successResponse(res, { projects });
});

router.get("/:projectId", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
    return errorResponse(res, 400, "Invalid project id.");
  }

  const project = await ProjectSession.findById(req.params.projectId).populate({
    path: "requestId",
    populate: [
      { path: "senderId", select: "name avatar department year skills" },
      { path: "receiverId", select: "name avatar department year skills" }
    ]
  });

  if (!project) {
    return errorResponse(res, 404, "Project not found.");
  }

  if (!isMember(project, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this project.");
  }

  return successResponse(res, { project });
});

router.patch("/:projectId", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
    return errorResponse(res, 400, "Invalid project id.");
  }

  const project = await ProjectSession.findById(req.params.projectId);
  if (!project) {
    return errorResponse(res, 404, "Project not found.");
  }

  if (!isMember(project, req.user._id)) {
    return errorResponse(res, 403, "You are not part of this project.");
  }

  const allowedStatus = ["active", "paused", "completed", "cancelled"];
  if (req.body.status && !allowedStatus.includes(req.body.status)) {
    return errorResponse(res, 400, "Invalid project status.");
  }

  project.title = typeof req.body.title === "string" ? req.body.title.trim() : project.title;
  project.description =
    typeof req.body.description === "string" ? req.body.description.trim() : project.description;
  project.timeline =
    typeof req.body.timeline === "string" ? req.body.timeline.trim() : project.timeline;
  project.status = typeof req.body.status === "string" ? req.body.status.trim() : project.status;
  project.sharedResources = Array.isArray(req.body.sharedResources)
    ? req.body.sharedResources
        .map((item) => ({
          label: typeof item.label === "string" ? item.label.trim() : "",
          url: typeof item.url === "string" ? item.url.trim() : ""
        }))
        .filter((item) => item.label && item.url)
    : project.sharedResources;
  project.milestones = Array.isArray(req.body.milestones)
    ? req.body.milestones
        .map((item) => ({
          title: typeof item.title === "string" ? item.title.trim() : "",
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          isCompleted: Boolean(item.isCompleted)
        }))
        .filter((item) => item.title)
    : project.milestones;

  await project.save();
  return successResponse(res, { project });
});

export default router;
