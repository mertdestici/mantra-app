// 📁 controllers/audioController.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../utils/db');

const TXT_PATH = path.join(__dirname, '../data/mantra.txt');
const MP3_PATH = path.join(__dirname, '../data/mantra.mp3');

function getAllMantras() {
  return new Promise((resolve, reject) => {
    db.all('SELECT content FROM mantras ORDER BY id ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => r.content));
    });
  });
}

async function ensureMantraTxt(currentMantras) {
  if (!fs.existsSync(TXT_PATH)) {
    fs.writeFileSync(TXT_PATH, currentMantras.join('. '), 'utf-8');
    return;
  }

  const fileLines = fs.readFileSync(TXT_PATH, 'utf-8').split('\n');
  let mismatchIndex = fileLines.findIndex((line, i) => line !== currentMantras[i]);
  if (mismatchIndex === -1 && fileLines.length === currentMantras.length) return;

  const updatedLines = currentMantras.slice(0, currentMantras.length);
  fs.writeFileSync(TXT_PATH, updatedLines.join('\n'), 'utf-8');
}

async function generateMp3FromText(text) {
  const response = await axios.post('https://api.openai.com/v1/audio/speech', {
    model: 'gpt-4o-mini-tts',
    input: text,
    voice: 'alloy',
    instruction: 'Be more calm and wait 3 seconds after each sentences'
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    responseType: 'stream'
  });

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
    await ensureMantraTxt(mantras);

    if (!fs.existsSync(MP3_PATH)) {
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
