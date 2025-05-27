const express = require('express');
const router = express.Router();
const { rephraseText, saveText, getNextMantra, deleteMantra } = require('../controllers/mantraController');

router.post('/rephrase', rephraseText);
router.post('/save', saveText);
router.get('/mantras/next/:afterId', getNextMantra);
router.delete('/mantras/:id', deleteMantra);


module.exports = router;
