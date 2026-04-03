import express from "express";
import { seedDemoData } from "../utils/seedDemoData.js";

const router = express.Router();

router.post("/seed-demo", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Demo seeding is disabled in production." });
  }

  const result = await seedDemoData();
  return res.json({ message: "Demo data seeded.", result });
});

export default router;
