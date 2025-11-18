const { smartRephrase } = require('../utils/rephraseMock');
const db = require('../utils/db');

const rephraseText = async (req, res) => {
  const { text, rephrasedText } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  try {
    return res.json({ rephrasedText });
  } catch (error) {
    console.error('Rephrase Error:', error);
    return res.status(500).json({ error: 'Rephrasing failed.' });
  }
};

const rephraseTextAI = async (req, res) => {
  const { text, rephrasedText } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  try {
    const rephrased = await smartRephrase(text, rephrasedText);
    return res.json({ rephrased });
  } catch (error) {
    console.error('Rephrase Error:', error);
    return res.status(500).json({ error: 'Rephrasing failed.' });
  }
};

const saveText = async (req, res) => {
  const { id, text } = req.body;
  if (!id || !text) return res.status(400).json({ error: 'ID and text are required.' });

  try {
    const result = await db.query('UPDATE mantras SET content = $1 WHERE id = $2 RETURNING id, content', [
      text,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mantra not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ error: 'Failed to update mantra.' });
  }
};

const getNextMantra = async (req, res) => {
  const afterId = parseInt(req.params.afterId, 10);
  if (isNaN(afterId)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    const result = await db.query('SELECT * FROM mantras WHERE id > $1 ORDER BY id ASC LIMIT 1', [afterId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No more mantras.' });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get Next Mantra Error:', error);
    res.status(500).json({ error: 'Failed to fetch mantra.' });
  }
};

const deleteMantra = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'ID is required to delete.' });

  try {
    const result = await db.query('DELETE FROM mantras WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mantra not found.' });
    }

    res.status(200).json({ message: 'Mantra deleted successfully.' });
  } catch (error) {
    console.error('Delete Mantra Error:', error);
    res.status(500).json({ error: 'Failed to delete mantra.' });
  }
};

const getAllMantras = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM mantras ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get All Mantras Error:', error);
    res.status(500).json({ error: 'Failed to fetch mantras.' });
  }
};

const createMantra = async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required.' });

  try {
    const result = await db.query('INSERT INTO mantras (content) VALUES ($1) RETURNING *', [text.trim()]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create Mantra Error:', error);
    res.status(500).json({ error: 'Failed to create mantra.' });
  }
};

module.exports = {
  rephraseText,
  rephraseTextAI,
  saveText,
  getNextMantra,
  deleteMantra,
  getAllMantras,
  createMantra
};
