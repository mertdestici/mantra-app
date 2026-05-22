<div align="center">

# Mantra App

Daily mantra generator, editor, and audio player built with a React front end and an Express/Neon backend.

</div>

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Architecture](#architecture)  
4. [Getting Started](#getting-started)  
5. [Environment Variables](#environment-variables)  
6. [API Reference](#api-reference)  
7. [Managing the Mantra Library](#managing-the-mantra-library)  
8. [Deployment Notes](#deployment-notes)  
9. [Project Structure](#project-structure)

---

## Overview

The Mantra App helps users browse a curated list of mantras, rewrite them to match their tone, and listen to an AI‑generated audio version. The UI uses a dark “studio” aesthetic with glassmorphism cards, and the data layer stores mantras in a Neon-hosted PostgreSQL database.

Key modules:

- **Main Menu:** entry point with shortcuts to mantra flow and audio player.
- **Mantra Screen:** fetches sequential mantras, lets users discard, rewrite, or add new ones.
- **Rephrase Screen:** provides manual editing and optional AI-powered rephrasing.
- **Player Screen:** fetches Amazon Polly TTS audio for the latest mantra with background ambience.
- **Backend:** Express API handling mantra CRUD, AI rephrase requests, and audio generation.

---

## Features

- 🎯 **Daily Flow:** Step through mantras in order with “Next”, “Rewrite”, “Remove”, and “Add New” actions.
- ✍️ **Rephrase Workspace:** Edit mantras manually or call AI helpers; save changes back to the DB.
- 🔊 **Audio Player:** Streams an MP3 synthesized from the mantra library using Amazon Polly TTS.
- 🗂️ **Neon/Postgres Persistence:** Reliable storage across deployments; supports both dev/prod URLs.
- 🧩 **Configurable API Base:** Frontend fetches automatically switch between local backend and production.
- 📦 **Utility Scripts:** `loadMantras.js` seeds the DB or exports all rows to text.

---

## Architecture

| Layer      | Stack / Details                                                                 |
| ---------- | -------------------------------------------------------------------------------- |
| Frontend   | React (CRA), custom CSS (`App.css`), functional components                        |
| State Mgmt | Local component state (React hooks)                                              |
| Backend    | Node.js, Express, Axios, OpenAI SDK, AWS SDK (Polly)                            |
| Database   | Neon PostgreSQL via `pg` pool (dev/prod URLs + SSL detection)                    |
| Styling    | Glassmorphism-inspired styles in `frontend/src/App.css`                         |
| Audio      | Amazon Polly (`Ruth`, neural) synthesized from SSML to `backend/data/mantra.mp3` |

Directory split:

```
frontend/   React app
backend/    Express API + scripts + Neon integration
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd mantra-app

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env` and `frontend/.env.local` (details below). Ensure both dev and prod database URLs exist before starting the backend.

### 3. Run Locally

```bash
# Backend (from /backend)
npm run dev         # starts on http://localhost:4000

# Frontend (from /frontend)
npm start           # opens http://localhost:3000
```

The frontend proxies API calls based on `REACT_APP_API_BASE`. Set it to `http://localhost:4000` (or whichever port the backend uses).

---

## Environment Variables

### Backend (`backend/.env`)

```
OPENAI_API_KEY=sk-...
DATABASE_URL_DEV=postgresql://... (Neon dev connection string)
DATABASE_URL_PROD=postgresql://... (Neon prod connection string)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
PORT=4000
```

Optional:

- `DATABASE_URL` – fallback if you only have one URL.
- `DB_SSL=true` – forces SSL regardless of environment.

`OPENAI_API_KEY` powers the AI rephrase helper. `AWS_*` credentials power audio
generation via Amazon Polly — the IAM principal needs the `polly:SynthesizeSpeech`
permission.

### Frontend (`frontend/.env`)

```
REACT_APP_API_BASE=http://localhost:4000
```

Omit `.env` when deploying.

---

## API Reference

Base path: `/api`

| Method | Route                    | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| POST   | `/rephrase`             | Returns the user-provided rewrite (mock). |
| POST   | `/rephraseAI`           | Uses `smartRephrase` AI helper.           |
| POST   | `/save`                 | Updates an existing mantra by ID.         |
| POST   | `/mantras`              | **Create** a new mantra (text required).  |
| GET    | `/mantras`              | Returns all mantras (ordered).            |
| GET    | `/mantras/next/:afterId`| Returns the next mantra after `afterId`.  |
| DELETE | `/mantras/:id`          | Deletes a mantra.                         |
| GET    | `/mantra/audio`         | Streams (and regenerates if needed) MP3.  |

All routes expect/return JSON except `/mantra/audio` (which streams an MP3 file).

---

## Managing the Mantra Library

- **Mantra Screen:** Use the “Add New Mantra” button to open the dedicated creation view. Submitting POSTs to `/api/mantras` and refreshes the displayed mantra.
- **Deleting:** “Remove from Library” calls `DELETE /api/mantras/:id`.
- **Rephrasing:** Saves call `/api/save` with the mantra ID.

---

## Deployment Notes

1. **Neon Database**
   - Provision dev/prod branches in Neon.
   - Update `DATABASE_URL_DEV` / `DATABASE_URL_PROD`.
   - Neon requires SSL; `db.js` auto-enables it for `*.neon.tech` URLs.

2. **Hosting**
   - Ensure the backend service loads environment variables before requiring routes (`dotenv.config()` is at the top of `server.js`).
   - When redeploying, data persists because it lives in Neon, not in the repo.

3. **Frontend**
   - Build via `npm run build` inside `frontend/`.
   - Serve static files or deploy separately (e.g., Render Web Service, Vercel, Netlify).

4. **Audio Regeneration**
   - `audioController` builds an SSML document (`data/mantra.ssml`) from the whole mantra library, inserting a 10-second `<break>` after each mantra.
   - If that SSML changes (or the MP3 is missing), it re-synthesizes the MP3 with Amazon Polly.

---

## Project Structure

```
mantra-app/
├── backend/
│   ├── controllers/        # mantra + audio controllers
│   ├── routes/             # Express routes
│   ├── utils/              # db pool, AI mocks
│   ├── data/               # generated mantra.ssml / mantra.mp3
│   └── server.js           # Express entry
├── frontend/
│   ├── src/
│   │   ├── components/     # MainMenu, MantraScreen, AddMantraScreen, etc.
│   │   ├── utils/api.js    # API base helper
│   │   └── App.js / App.css
│   └── public/
└── README.md               # this file
```

---

Enjoy building and iterating on your mantra flow! If you add new endpoints, mirror them in `apiUrl` usage and keep Neon connection details updated for both development and production. Happy coding. 🙌
