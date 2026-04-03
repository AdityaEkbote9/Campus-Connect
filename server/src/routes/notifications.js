import express from "express";
import mongoose from "mongoose";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return successResponse(res, { notifications, unreadCount });
});

router.patch("/:notificationId/read", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.notificationId)) {
    return errorResponse(res, 400, "Invalid notification id.");
  }

  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    userId: req.user._id
  });
  if (!notification) {
    return errorResponse(res, 404, "Notification not found.");
  }

  notification.isRead = true;
  await notification.save();

  return successResponse(res, { notification });
});

export default router;
