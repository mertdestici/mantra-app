const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../utils/db');

const TXT_PATH = path.join(__dirname, '../data/mantra.txt');
const MP3_PATH = path.join(__dirname, '../data/mantra.mp3');

async function getAllMantras() {
  const result = await db.query('SELECT content FROM mantras ORDER BY id ASC');
  return result.rows.map((row) => row.content);
}

async function ensureMantraTxt(currentMantras) {
  let fileChanged = false;
  const newContent = currentMantras.join('\n');

  if (!fs.existsSync(TXT_PATH)) {
    fs.writeFileSync(TXT_PATH, newContent, 'utf-8');
    return { fileChanged: true };
  }

  const existingLines = fs
    .readFileSync(TXT_PATH, 'utf-8')
    .split(/\r?\n/);
  while (existingLines.length && existingLines[existingLines.length - 1] === '') {
    existingLines.pop();
  }

  const needsRewrite =
    existingLines.length !== currentMantras.length ||
    currentMantras.some((line, index) => existingLines[index] !== line);

  if (needsRewrite) {
    fs.writeFileSync(TXT_PATH, newContent, 'utf-8');
    fileChanged = true;
  }

  return { fileChanged };
}

async function generateMp3FromText(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/audio/speech',
    {
      model: 'gpt-4o-mini-tts',
      input: text,
      voice: 'alloy',
      instruction: 'Be more calm and wait 3 seconds after each sentences'
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    }
  );

  const writer = fs.createWriteStream(MP3_PATH);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function streamMantraAudio(req, res) {
  try {
    const mantras = await getAllMantras();
    const { fileChanged = false } = (await ensureMantraTxt(mantras)) || {};

    const shouldRegenerateAudio = fileChanged || !fs.existsSync(MP3_PATH);
    if (shouldRegenerateAudio) {
      const message = mantras.join('. ... ') + '.';
      await generateMp3FromText(message);
    }

    res.sendFile(MP3_PATH);
  } catch (err) {
    console.error('Mantra audio üretilemedi:', err);
    res.status(500).json({ error: 'Mantra audio üretilemedi.' });
  }
}

module.exports = { streamMantraAudio };
