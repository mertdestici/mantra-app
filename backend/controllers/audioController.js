const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const db = require('../utils/db');

const CACHE_DIR = path.join(__dirname, '../data/audio-cache');
const SIG_PATH = path.join(CACHE_DIR, '.content-sig');

const VOICE_ID = 'Ruth';
const ENGINE = 'neural';
const OUTPUT_FORMAT = 'mp3';

const MIN_BREAK = 1;
const MAX_BREAK = 15;
const DEFAULT_BREAK = 10;

// Conservative budgets kept below Polly SynthesizeSpeech hard limits
// (3000 billed text chars / 6000 total chars including SSML markup).
const MAX_BILLED = 2500;
const MAX_TOTAL = 5000;

// SynthesizeSpeech also caps each call's output audio at 10 minutes;
// chunks are budgeted by estimated duration to stay well under it.
const CHARS_PER_SECOND = 15;
const MAX_DURATION_SECONDS = 8 * 60;

const polly = new PollyClient({ region: process.env.AWS_REGION });

async function getAllMantras() {
  const result = await db.query('SELECT content FROM mantras ORDER BY id ASC');
  return result.rows.map((row) => row.content);
}

function escapeSsml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function breakTag(breakSeconds) {
  return `<break time="${breakSeconds}s"/>`;
}

function buildSsml(mantras, breakSeconds) {
  const tag = breakTag(breakSeconds);
  const body = mantras.map((mantra) => `${escapeSsml(mantra)}${tag}`).join('');
  return `<speak>${body}</speak>`;
}

// Break-independent fingerprint of the mantra content. When it changes,
// every cached break variant is stale.
function contentSignature(mantras) {
  return crypto.createHash('sha256').update(mantras.join('\u0000')).digest('hex');
}

// Splits mantras into batches that stay within Polly's per-request limits.
// Each chunk is synthesized separately and the MP3 buffers are concatenated.
function chunkMantras(mantras, breakSeconds) {
  const chunks = [];
  let current = [];
  let billed = 0;
  let total = 0;
  let duration = 0;

  const tagLength = breakTag(breakSeconds).length;

  for (const mantra of mantras) {
    const mantraBilled = mantra.length;
    const mantraTotal = escapeSsml(mantra).length + tagLength;
    const mantraDuration = mantra.length / CHARS_PER_SECOND + breakSeconds;

    if (
      current.length &&
      (billed + mantraBilled > MAX_BILLED ||
        total + mantraTotal > MAX_TOTAL ||
        duration + mantraDuration > MAX_DURATION_SECONDS)
    ) {
      chunks.push(current);
      current = [];
      billed = 0;
      total = 0;
      duration = 0;
    }

    current.push(mantra);
    billed += mantraBilled;
    total += mantraTotal;
    duration += mantraDuration;
  }

  if (current.length) {
    chunks.push(current);
  }

  return chunks;
}

async function synthesizeChunk(ssml) {
  const command = new SynthesizeSpeechCommand({
    Text: ssml,
    TextType: 'ssml',
    VoiceId: VOICE_ID,
    Engine: ENGINE,
    OutputFormat: OUTPUT_FORMAT
  });

  const response = await polly.send(command);
  const bytes = await response.AudioStream.transformToByteArray();
  return Buffer.from(bytes);
}

async function generateMp3(mantras, breakSeconds, outputPath) {
  const buffers = [];
  for (const chunk of chunkMantras(mantras, breakSeconds)) {
    buffers.push(await synthesizeChunk(buildSsml(chunk, breakSeconds)));
  }
  fs.writeFileSync(outputPath, Buffer.concat(buffers));
}

function cachePathFor(breakSeconds) {
  return path.join(CACHE_DIR, `mantra-${breakSeconds}.mp3`);
}

// Drops every cached MP3 when the mantra content has changed.
function syncCacheSignature(mantras) {
  const signature = contentSignature(mantras);
  const stored = fs.existsSync(SIG_PATH) ? fs.readFileSync(SIG_PATH, 'utf-8') : null;

  if (stored === signature) return;

  for (const file of fs.readdirSync(CACHE_DIR)) {
    if (file.startsWith('mantra-') && file.endsWith('.mp3')) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
  }
  fs.writeFileSync(SIG_PATH, signature, 'utf-8');
}

function parseBreakSeconds(raw) {
  if (raw === undefined) return DEFAULT_BREAK;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < MIN_BREAK || value > MAX_BREAK) {
    return null;
  }
  return value;
}

async function streamMantraAudio(req, res) {
  const breakSeconds = parseBreakSeconds(req.query.break);
  if (breakSeconds === null) {
    return res
      .status(400)
      .json({ error: `break must be an integer between ${MIN_BREAK} and ${MAX_BREAK}.` });
  }

  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });

    const mantras = await getAllMantras();
    syncCacheSignature(mantras);

    const mp3Path = cachePathFor(breakSeconds);
    if (!fs.existsSync(mp3Path)) {
      await generateMp3(mantras, breakSeconds, mp3Path);
    }

    res.sendFile(mp3Path);
  } catch (err) {
    console.error('Mantra audio üretilemedi:', err);
    res.status(500).json({ error: 'Mantra audio üretilemedi.' });
  }
}

module.exports = { streamMantraAudio };
