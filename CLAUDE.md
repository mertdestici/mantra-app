# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Two separate npm projects — run each from its own directory.

**Backend** (`cd backend`)
```bash
npm run dev      # nodemon, restarts on change — port 4000
npm start        # production node
```

**Frontend** (`cd frontend`)
```bash
npm start        # CRA dev server — port 3000
npm test         # Jest/React Testing Library (watch mode)
npm run build    # production build to frontend/build/
```

No root-level script runs both; start them in separate terminals.

## Environment Variables

**`backend/.env`**
```
OPENAI_API_KEY=sk-...
DATABASE_URL_DEV=postgresql://...   # Neon dev branch
DATABASE_URL_PROD=postgresql://...  # Neon prod branch
PORT=4000
```

**`frontend/.env`** (omit in production)
```
REACT_APP_API_BASE=http://localhost:4000
```

`frontend/package.json` has `"proxy": "http://localhost:4000"` for CRA dev, but all fetch calls go through `apiUrl()` which reads `REACT_APP_API_BASE` — set this in `.env` for local development.

## Architecture

### Frontend — screen-based SPA

Navigation is pure React state; there is no router. `App.js` holds a `screen` string and a `currentMantra` / `currentMantraId` pair that is passed down as props. Switching screens is done by calling the `onGoTo*` / `onBack` callbacks.

```
App.js  (screen state, mantraId state)
  ├── MainMenu
  ├── MantraScreen    — fetches next mantra by ID, delete-to-skip
  ├── RephraseScreen  — manual edit + optional AI rephrase
  ├── AddMantraScreen — POST new mantra
  ├── AllMantrasScreen
  └── PlayerScreen    — dual audio (background loop + TTS mantra)
```

All API calls use `apiUrl(path)` from `src/utils/api.js`, which prepends `REACT_APP_API_BASE`.

All visual styles live in a single `src/App.css`. The design system uses CSS custom properties (`--shadow-clay-*`, `--font-heading`, `--border-thick`, etc.) defined in `:root`. The current aesthetic is **Claymorphism** (Fredoka headings, Nunito body, thick 3 px borders, dual inner/outer clay shadows).

### Backend — Express + Neon PostgreSQL

```
server.js          entry; mounts /api routes
routes/
  mantraRoutes     CRUD + next-by-id
  audioRoutes      single GET /mantra/audio
controllers/
  mantraController direct pg queries (no ORM)
  audioController  file-cache + OpenAI TTS pipeline
utils/
  db.js            pg Pool; auto-SSL for *.neon.tech URLs
  rephraseMock.js  smartRephrase() — calls GPT-4 via /v1/responses
```

**Database**: `db.js` selects `DATABASE_URL_DEV` or `DATABASE_URL_PROD` based on `NODE_ENV`, with SSL enabled automatically for Neon URLs. There is no migration system; the `mantras` table (`id`, `content`) must exist before running.

**Audio pipeline** (`GET /api/mantra/audio`):
1. Fetches all mantras from DB ordered by `id`.
2. Compares against `backend/data/mantra.txt` — rewrites the file if content changed.
3. Regenerates `backend/data/mantra.mp3` via OpenAI `gpt-4o-mini-tts` only when `mantra.txt` changed or the MP3 is missing.
4. Serves the MP3 file directly with `res.sendFile`.

**Rephrase routes**:
- `POST /api/rephrase` — passthrough mock (returns the user-supplied `rephrasedText` as-is).
- `POST /api/rephraseAI` — calls `smartRephrase()`, which hits the OpenAI `/v1/responses` endpoint with GPT-4.

### Mantra navigation

`MantraScreen` fetches `GET /api/mantras/next/:afterId` to advance sequentially. The current `mantraId` is lifted to `App.js` so it survives screen transitions (e.g. going into RephraseScreen and back). Deleting a mantra automatically advances to the next one using the deleted ID as the `afterId`.
