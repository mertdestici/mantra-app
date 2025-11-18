const express = require('express');
const router = express.Router();
const {
  rephraseText,
  rephraseTextAI,
  saveText,
  getNextMantra,
  deleteMantra,
  getAllMantras,
  createMantra
} = require('../controllers/mantraController');

router.post('/rephrase', rephraseText);
router.post('/rephraseAI', rephraseTextAI);
router.post('/save', saveText);
router.post('/mantras', createMantra);
router.get('/mantras', getAllMantras);
router.get('/mantras/next/:afterId', getNextMantra);
router.delete('/mantras/:id', deleteMantra);

module.exports = router;
