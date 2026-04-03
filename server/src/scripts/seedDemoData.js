import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { seedDemoData } from "../utils/seedDemoData.js";

const run = async () => {
  try {
    await connectDatabase();
    const result = await seedDemoData();
    console.log("Demo data seeded successfully.", result);
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    await mongoose.disconnect();
  }
};

run();
