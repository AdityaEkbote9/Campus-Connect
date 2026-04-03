import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { ProjectSession } from "../models/ProjectSession.js";
import { Review } from "../models/Review.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { recalculateReputation } from "../utils/calculateReputation.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { projectSessionId, revieweeId, rating } = req.body;
  const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
  const categories = {
    communication: Number(req.body.communication ?? rating ?? 5),
    skillQuality: Number(req.body.skillQuality ?? rating ?? 5),
    reliability: Number(req.body.reliability ?? rating ?? 5),
    timeliness: Number(req.body.timeliness ?? rating ?? 5),
    teamwork: Number(req.body.teamwork ?? rating ?? 5)
  };
  const flagGhosting = Boolean(req.body.flagGhosting);

  if (
    !mongoose.Types.ObjectId.isValid(projectSessionId) ||
    !mongoose.Types.ObjectId.isValid(revieweeId)
  ) {
    return errorResponse(res, 400, "Valid projectSessionId and revieweeId are required.");
  }

  const session = await ProjectSession.findById(projectSessionId);

  if (!session) {
    return errorResponse(res, 404, "Project session not found.");
  }

  const isMember = session.memberIds.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );
  const revieweeInSession = session.memberIds.some(
    (memberId) => memberId.toString() === revieweeId
  );

  if (!isMember || !revieweeInSession) {
    return errorResponse(res, 403, "Review can only be submitted by project members.");
  }

  if (revieweeId === req.user._id.toString()) {
    return errorResponse(res, 400, "You cannot review yourself.");
  }

  if (session.status !== "completed") {
    return errorResponse(res, 400, "Reviews are only allowed after completion.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return errorResponse(res, 400, "Rating must be an integer from 1 to 5.");
  }

  const invalidCategory = Object.values(categories).some(
    (score) => !Number.isInteger(score) || score < 1 || score > 5
  );
  if (invalidCategory) {
    return errorResponse(res, 400, "Category ratings must be integers from 1 to 5.");
  }

  try {
    const review = await Review.create({
      projectSessionId,
      reviewerId: req.user._id,
      revieweeId,
      rating,
      ...categories,
      flagGhosting,
      comment
    });

    await recalculateReputation(new mongoose.Types.ObjectId(revieweeId));
    await createNotification({
      userId: revieweeId,
      type: "review_received",
      title: "New teammate review",
      body: `${req.user.name} left you feedback on a completed project.`,
      link: `/students/${revieweeId}`
    });

    const populated = await review.populate("reviewerId", "name avatar department year");
    return successResponse(res, { review: populated }, 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, "You already reviewed this teammate for this project.");
    }

    throw error;
  }
});

router.get("/user/:userId", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return errorResponse(res, 400, "Invalid user id.");
  }

  const reviews = await Review.find({ revieweeId: req.params.userId })
    .populate("reviewerId", "name avatar department year")
    .sort({ createdAt: -1 })
    .limit(20);

  return successResponse(res, { reviews });
});

export default router;
