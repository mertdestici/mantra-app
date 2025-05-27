const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

const filePath = path.join(__dirname, 'mantras.txt');

// Dosya satırlarını oku
const lines = fs.readFileSync(filePath, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

// Her satırı veritabanına ekle
db.serialize(() => {
  const stmt = db.prepare('INSERT INTO mantras (content) VALUES (?)');

  lines.forEach(line => {
    stmt.run(line, err => {
      if (err) console.error('❌ Insert failed:', err.message);
      else console.log('✅ Inserted:', line);
    });
  });

  stmt.finalize(() => {
    console.log('🎉 All mantras loaded into database.');
    db.close();
  });
});
