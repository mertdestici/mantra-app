const { smartRephrase } = require('../utils/rephraseMock');
const db = require('../utils/db');

const rephraseText = async (req, res) => {
  const { text, rephrasedText } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  try {
    return res.json({ rephrasedText });
  } catch (error) {
    console.error("Rephrase Error:", error);
    return res.status(500).json({ error: "Rephrasing failed." });
  }
};

const rephraseTextAI = async (req, res) => {
  const { text, rephrasedText } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  try {
    const rephrased = await smartRephrase(text, rephrasedText);
    return res.json({ rephrased });
  } catch (error) {
    console.error("Rephrase Error:", error);
    return res.status(500).json({ error: "Rephrasing failed." });
  }
};

const saveText = (req, res) => {
  const { id, text } = req.body;
  if (!id || !text) return res.status(400).json({ error: 'ID and text are required.' });

  db.run('UPDATE mantras SET content = ? WHERE id = ?', [text, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mantra not found.' });
    }

    res.status(200).json({ id, content: text });
  });
};

const getNextMantra = (req, res) => {
  const afterId = parseInt(req.params.afterId, 10);
  if (isNaN(afterId)) return res.status(400).json({ error: 'Invalid ID' });

  db.get('SELECT * FROM mantras WHERE id > ? ORDER BY id ASC LIMIT 1', [afterId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'No more mantras.' });
    return res.json(row);
  });
};


const deleteMantra = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'ID is required to delete.' });

  db.run('DELETE FROM mantras WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mantra not found.' });
    }

    res.status(200).json({ message: 'Mantra deleted successfully.' });
  });
};

module.exports = { rephraseText, rephraseTextAI, saveText, getNextMantra, deleteMantra };
