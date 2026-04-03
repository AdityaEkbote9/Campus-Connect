import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { CollaborationRequest } from "../models/CollaborationRequest.js";
import { Conversation } from "../models/Conversation.js";
import { Notification } from "../models/Notification.js";
import { ProjectSession } from "../models/ProjectSession.js";
import { Review } from "../models/Review.js";

const router = express.Router();

router.get("/summary", requireAuth, async (req, res) => {
  const userId = req.user._id;

  const [
    incomingPending,
    outgoingPending,
    activeProjects,
    completedProjects,
    recentRequests,
    topRatings,
    unreadNotifications,
    unreadConversations
  ] = await Promise.all([
    CollaborationRequest.countDocuments({ receiverId: userId, status: "pending" }),
    CollaborationRequest.countDocuments({ senderId: userId, status: "pending" }),
    ProjectSession.countDocuments({ memberIds: userId, status: "active" }),
    ProjectSession.countDocuments({ memberIds: userId, status: "completed" }),
    CollaborationRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .sort({ createdAt: -1 })
      .limit(4),
    Review.aggregate([
      { $match: { revieweeId: userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      { $group: { _id: "$revieweeId", averageRating: { $avg: "$rating" } } }
    ]),
    Notification.countDocuments({ userId, isRead: false }),
    Conversation.countDocuments({ memberIds: userId })
  ]);

  const skillHighlights = req.user.skills.slice(0, 4);

  return res.json({
    stats: {
      incomingPending,
      outgoingPending,
      activeProjects,
      completedProjects,
      reputationScore: req.user.reputationScore,
      reviewCount: req.user.reviewCount,
      averageRecentRating: topRatings[0] ? Number(topRatings[0].averageRating.toFixed(1)) : 0,
      unreadNotifications,
      unreadConversations,
      profileCompletionScore: req.user.profileCompletionScore,
      completedProjectsCount: req.user.completedProjectsCount
    },
    skillHighlights,
    recentRequests: recentRequests.map((request) => ({
      _id: request._id,
      projectTitle: request.projectTitle,
      status: request.status,
      direction:
        request.senderId._id.toString() === userId.toString() ? "outgoing" : "incoming",
      counterpart:
        request.senderId._id.toString() === userId.toString()
          ? request.receiverId?.name
          : request.senderId?.name,
      urgency: request.urgency
    }))
  });
});

export default router;
