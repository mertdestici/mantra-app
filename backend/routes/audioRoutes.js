const express = require('express');
const router = express.Router();
const { streamMantraAudio } = require('../controllers/audioController');

router.get('/mantra/audio', streamMantraAudio);

module.exports = router;