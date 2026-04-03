import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const useMemoryServer = process.env.USE_IN_MEMORY_DB === "true";

  if (!mongoUri && !useMemoryServer) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (useMemoryServer) {
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    console.log("MongoDB memory server connected");
    return;
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
  }
};
