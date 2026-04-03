import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { calculateProfileCompletionScore } from "../utils/profileScore.js";

const router = express.Router();

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const sanitizeList = (value) =>
  Array.isArray(value)
    ? [...new Set(value.map((item) => sanitizeText(item)).filter(Boolean))]
    : [];
const sanitizeLinks = (value) =>
  Array.isArray(value)
    ? [...new Set(value.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 6))]
    : [];

const isProfileComplete = (profile) =>
  Boolean(
    profile.name &&
      profile.username &&
      profile.collegeName &&
      profile.githubUsername &&
      profile.department &&
      profile.year &&
      profile.semester &&
      profile.bio &&
      profile.availability &&
      profile.preferredCollaborationMode &&
      profile.skills?.length
  );

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

router.put("/me", requireAuth, async (req, res) => {
  req.user.name = sanitizeText(req.body.name);
  req.user.username = sanitizeText(req.body.username).toLowerCase();
  req.user.collegeName = sanitizeText(req.body.collegeName);
  req.user.githubUsername = sanitizeText(req.body.githubUsername);
  req.user.department = sanitizeText(req.body.department);
  req.user.year = sanitizeText(req.body.year);
  req.user.semester = sanitizeText(req.body.semester);
  req.user.bio = sanitizeText(req.body.bio);
  req.user.skills = sanitizeList(req.body.skills);
  req.user.preferredProjectTypes = sanitizeList(req.body.preferredProjectTypes);
  req.user.links = sanitizeLinks(req.body.links);
  req.user.preferredCollaborationMode = sanitizeText(req.body.preferredCollaborationMode);
  req.user.availability = sanitizeText(req.body.availability);

  if (!req.user.name) {
    return res.status(400).json({ message: "Name is required." });
  }

  if (!req.user.username) {
    return res.status(400).json({ message: "Username is required." });
  }

  if (!req.user.collegeName) {
    return res.status(400).json({ message: "College name is required." });
  }

  if (req.user.bio && req.user.bio.length < 20) {
    return res.status(400).json({ message: "Bio must be at least 20 characters long." });
  }

  if (
    req.user.preferredCollaborationMode &&
    !["online", "offline", "hybrid"].includes(req.user.preferredCollaborationMode)
  ) {
    return res.status(400).json({ message: "Preferred collaboration mode is invalid." });
  }

  const existingUsername = await User.findOne({
    username: req.user.username,
    _id: { $ne: req.user._id }
  });
  if (existingUsername) {
    return res.status(409).json({ message: "Username is already in use." });
  }

  req.user.profileCompletionScore = calculateProfileCompletionScore(req.user);
  req.user.completedProfile = isProfileComplete(req.user);
  await req.user.save();
  return res.json({ user: req.user });
});

router.get("/search", requireAuth, async (req, res) => {
  const skill = sanitizeText(req.query.skill);
  const projectType = sanitizeText(req.query.projectType);
  const urgency = sanitizeText(req.query.urgency);
  const collegeName = sanitizeText(req.query.collegeName);
  const department = sanitizeText(req.query.department);
  const year = sanitizeText(req.query.year);
  const semester = sanitizeText(req.query.semester);
  const preferredCollaborationMode = sanitizeText(req.query.preferredCollaborationMode);
  const minimumReliability = Number(req.query.minimumReliability || 0);
  const availability = sanitizeText(req.query.availability);
  const githubReady = sanitizeText(req.query.githubReady);
  const sortBy = sanitizeText(req.query.sortBy) || "relevance";
  const query = {
    completedProfile: true,
    _id: { $ne: req.user._id }
  };

  if (skill) {
    query.skills = { $elemMatch: { $regex: skill, $options: "i" } };
  }

  if (projectType) {
    query.preferredProjectTypes = { $elemMatch: { $regex: projectType, $options: "i" } };
  }

  if (collegeName) {
    query.collegeName = { $regex: collegeName, $options: "i" };
  }

  if (department) {
    query.department = { $regex: department, $options: "i" };
  }

  if (year) {
    query.year = { $regex: year, $options: "i" };
  }

  if (semester) {
    query.semester = { $regex: semester, $options: "i" };
  }

  if (preferredCollaborationMode) {
    query.preferredCollaborationMode = preferredCollaborationMode;
  }

  if (minimumReliability > 0) {
    query.reputationScore = { $gte: minimumReliability };
  }

  if (availability) {
    query.availability = { $regex: availability, $options: "i" };
  }

  if (githubReady === "true") {
    query.githubUsername = { $ne: "" };
  }

  const sortMap = {
    relevance: { reputationScore: -1, reviewCount: -1, updatedAt: -1 },
    rating: { reputationScore: -1, reviewCount: -1 },
    newest: { createdAt: -1 },
    reliable: { reputationScore: -1, completedProjectsCount: -1 }
  };

  const users = await User.find(query)
    .select("-email")
    .sort(
      urgency === "high"
        ? { profileCompletionScore: -1, ...sortMap[sortBy] }
        : sortMap[sortBy] ?? sortMap.relevance
    )
    .limit(25);

  return res.json({ users });
});

router.get("/:userId", requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const user = await User.findById(req.params.userId).select("-email");

  if (!user || !user.completedProfile) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const reviews = await Review.find({ revieweeId: user._id })
    .populate("reviewerId", "name avatar department year")
    .sort({ createdAt: -1 })
    .limit(5);

  const ratingSummary = reviews.length
    ? {
        communication: Number(
          (reviews.reduce((sum, review) => sum + (review.communication ?? 0), 0) / reviews.length).toFixed(1)
        ),
        skillQuality: Number(
          (reviews.reduce((sum, review) => sum + (review.skillQuality ?? 0), 0) / reviews.length).toFixed(1)
        ),
        reliability: Number(
          (reviews.reduce((sum, review) => sum + (review.reliability ?? 0), 0) / reviews.length).toFixed(1)
        ),
        timeliness: Number(
          (reviews.reduce((sum, review) => sum + (review.timeliness ?? 0), 0) / reviews.length).toFixed(1)
        ),
        teamwork: Number(
          (reviews.reduce((sum, review) => sum + (review.teamwork ?? 0), 0) / reviews.length).toFixed(1)
        )
      }
    : null;

  return res.json({ user, reviews, ratingSummary });
});

export default router;
