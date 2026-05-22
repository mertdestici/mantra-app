# Configurable Break + Per-Break Cached Audio — Design

Date: 2026-05-22

## Problem

The mantra audio pipeline hardcodes a `10s` break between mantras. Users
cannot adjust the pause length. Additionally, regenerating audio on every
request is wasteful — generation calls Amazon Polly multiple times and is slow.

We want users to set the break length, and we want generated MP3s cached so a
given break value is only synthesized once.

## Goals

- Let the user choose the break length (whole seconds, 1–15) from the player UI.
- Cache one MP3 per break value so repeated playback is instant.
- Regenerate only when needed: a break value not yet cached, or after the
  mantra content itself changes.

## Non-Goals

- No per-user or server-side persistence of the chosen break (browser only).
- No fractional-second breaks.
- No eager pre-generation of unused break variants.

## Decisions (resolved during brainstorming)

- **Break input range:** integers 1–15. At most 15 cached files.
- **Cache invalidation:** when mantra content changes, wipe all cached MP3s and
  regenerate lazily (per break, on first request after the change).
- **Break persistence:** remembered in the browser via `localStorage`.
- **Content-change detection:** a break-independent content signature (hash of
  the ordered mantra texts) stored on disk. Chosen over DB-derived heuristics
  (`MAX(id)` + row count) because those miss edits to existing mantras.

## Design

### 1. Backend — caching (`backend/controllers/audioController.js`)

- New folder `backend/data/audio-cache/` holding:
  - `mantra-<break>.mp3` — one file per break value (e.g. `mantra-7.mp3`).
  - `.content-sig` — the current mantra content signature.
- `BREAK_TIME`, `BREAK_TAG`, `BREAK_SECONDS` stop being module constants.
  `buildSsml`, `chunkMantras`, and `synthesizeChunk`/`generateMp3FromMantras`
  take `breakSeconds` as an argument. The break tag becomes
  `<break time="${breakSeconds}s"/>`.
- The duration-based chunking already in place continues to work; it simply
  reads the per-request `breakSeconds` instead of a constant.
- Content signature: a hash (e.g. SHA-256) of the ordered mantra `content`
  strings joined with a delimiter. Independent of break value.
- Request flow for break `N`:
  1. Fetch mantras; compute content signature.
  2. If signature differs from stored `.content-sig` (or it is missing):
     delete every `mantra-*.mp3` in the cache folder, write the new signature.
  3. If `mantra-N.mp3` does not exist: generate it (build SSML with break `N`,
     chunk, synthesize each chunk, concatenate buffers, write the file).
  4. Serve `mantra-N.mp3`.
- The previous single-file change detection (`ensureMantraSsml` comparing
  `mantra.ssml`) is replaced by the content signature. SSML is built in memory
  per request and no longer persisted. The old `mantra.ssml` and `mantra.mp3`
  files are no longer used.
- Add `backend/data/audio-cache/` to `.gitignore`.

### 2. API contract (`backend/routes/audioRoutes.js`)

- `GET /api/mantra/audio?break=<1-15>` → responds `audio/mpeg`.
- `break` missing → defaults to `10`.
- `break` non-integer or outside 1–15 → `400` with a JSON error.
- Polly/synthesis failure → `500` (unchanged behavior).

### 3. Frontend (`frontend/src/components/PlayerScreen.js`)

- New `breakSeconds` state, initialized from `localStorage` key
  `mantraBreakSeconds`, default `10`.
- A number input (`type="number"`, `min={1}`, `max={15}`) labeled
  "Break between mantras (sec)" inside the Mantra Playback card.
- On change: validate/clamp to integer 1–15, update state, write to
  `localStorage`.
- `loadMantraAudio` appends `?break=${breakSeconds}` to the fetch URL.
- When `breakSeconds` changes while audio is already loaded: mark the loaded
  audio stale — set `audioReady=false` and pause playback — so the next play
  re-fetches with the new break.

## Latency / UX

The first request for a never-used break runs Polly generation (several
seconds, multiple chunk calls). The existing `isLoadingAudio` spinner covers
this; no new UI is needed. Subsequent requests for that break serve the cached
file immediately.

## Error Handling

- Invalid `break` query parameter → `400`; the frontend surfaces the error via
  the existing `errorMessage` path.
- Synthesis failure → `500`, as today.

## Testing

The backend has no test framework. Verification is manual:

1. Request `break=5` then `break=10` → two files appear in `audio-cache/`.
2. Repeat a request for an existing break → served from cache, no Polly calls.
3. Edit a mantra in the app → cache folder wipes and rebuilds on next request.
4. In the UI, change the break value → reload re-fetches; the chosen value
   persists across a page reload.
