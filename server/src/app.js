import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import conversationRoutes from "./routes/conversations.js";
import dashboardRoutes from "./routes/dashboard.js";
import devRoutes from "./routes/dev.js";
import notificationRoutes from "./routes/notifications.js";
import profileRoutes from "./routes/profiles.js";
import projectRoutes from "./routes/projects.js";
import requestRoutes from "./routes/requests.js";
import sessionRoutes from "./routes/sessions.js";
import reviewRoutes from "./routes/reviews.js";
import { errorResponse } from "./utils/apiResponse.js";

const app = express();
const normalizeOrigin = (origin = "") => origin.replace(/\/$/, "");
const configuredOrigin = normalizeOrigin(process.env.CLIENT_ORIGIN || "");
const allowedOrigins = new Set(
  [configuredOrigin, "http://127.0.0.1:5173", "http://localhost:5173"].filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowedVercelPreview =
        configuredOrigin.includes(".vercel.app") && normalizedOrigin.endsWith(".vercel.app");

      if (allowedOrigins.has(normalizedOrigin) || isAllowedVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  return errorResponse(
    res,
    500,
    process.env.NODE_ENV === "development"
      ? `Something went wrong. ${error.message}`
      : "Something went wrong."
  );
});

export default app;
