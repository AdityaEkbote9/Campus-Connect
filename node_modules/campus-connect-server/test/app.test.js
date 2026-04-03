import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /api/health returns ok", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("GET /api/auth/me requires authentication", async () => {
  const response = await request(app).get("/api/auth/me");

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Authentication required.");
});

test("POST /api/dev/seed-demo is blocked in production mode", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const response = await request(app).post("/api/dev/seed-demo");

  assert.equal(response.status, 403);
  assert.equal(response.body.message, "Demo seeding is disabled in production.");

  process.env.NODE_ENV = previousNodeEnv;
});
