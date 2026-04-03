import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.name) {
      return res.status(400).json({ message: "Google account payload is invalid." });
    }

    const emailDomain = payload.email.split("@")[1];
    if (emailDomain !== process.env.COLLEGE_DOMAIN) {
      return res.status(403).json({
        message: `Only ${process.env.COLLEGE_DOMAIN} accounts can access Campus Connect.`
      });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        avatar: payload.picture ?? "",
        username: payload.email.toLowerCase().split("@")[0],
        collegeName: process.env.COLLEGE_NAME ?? "Campus Connect College",
        preferredCollaborationMode: "hybrid"
      });
    } else if (payload.picture && user.avatar !== payload.picture) {
      user.avatar = payload.picture;
      await user.save();
    }

    const token = createToken(user._id);
    return res.json({ token, user });
  } catch (error) {
    console.error("Google sign-in verification failed:", error);
    return res.status(401).json({
      message: "Google sign-in failed.",
      details: error.message
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

router.post("/signout", requireAuth, async (_req, res) => {
  return res.json({ success: true });
});

export default router;
