# Campus Connect

Campus Connect is a MERN-style web application for forming project teams inside a single college. Students authenticate with Google, complete a skill profile, discover teammates, send collaboration requests, work inside a project room, and leave ratings after the project ends.

## Monorepo layout

- `client/` React + Vite frontend
- `server/` Express + MongoDB backend

## Features in v1

- Campus-only Google sign-in
- Student onboarding with GitHub handle, skills, and preferences
- Searchable student directory with filters
- Collaboration request workflow
- Project room with status and chat
- Post-project ratings and reviews
- Dashboard summary cards and recent activity
- Demo seed script for showcase data

## Prerequisites

- Node.js 20+
- MongoDB connection string
- Google OAuth client ID for the frontend and backend verifier

## Environment setup

Create `server/.env` from `server/.env.example` and configure:

- `PORT`
- `MONGODB_URI`
- `USE_IN_MEMORY_DB`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `COLLEGE_DOMAIN`

Create `client/.env` with:

- `VITE_API_URL=http://localhost:5000/api`
- `VITE_GOOGLE_CLIENT_ID=<your google client id>`

## Run locally

```bash
npm install
npm run mongo:start
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

If you do not have MongoDB installed locally, set `USE_IN_MEMORY_DB=true` in `server/.env` for development. This uses an ephemeral in-memory MongoDB instance so the backend can run without a system database.

## Local MongoDB in this workspace

This project now includes a portable local MongoDB setup under `tools/mongodb/` with persistent data stored in `data/db/`.

To start it again later:

```bash
npm run mongo:start
```

The backend `server/.env` is currently configured to use:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/campus-connect
USE_IN_MEMORY_DB=false
```

## Demo data and tests

Seed example students, a request, a completed project, and reviews:

```bash
npm run seed:demo
```

If you want the data to survive restarts locally, start the bundled MongoDB instance first:

```bash
npm run mongo:start
```

Then set `USE_IN_MEMORY_DB=false` in `server/.env`.

Run basic backend smoke tests:

```bash
npm run test
```

## Deployment notes

- Frontend: Vite client can be deployed to Vercel or Netlify.
- Backend: Express API can be deployed to Render, Railway, or a Node server.
- For production, set `USE_IN_MEMORY_DB=false` and provide a real MongoDB URI.
- Configure the frontend API URL with `VITE_API_URL`.
- Update Google OAuth allowed origins to match your deployed frontend domain.
- `render.yaml` is included for a Render-style split deploy.
- `client/vercel.json` is included for SPA routing on Vercel.
