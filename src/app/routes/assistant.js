const express = require('express');
const TELEGRAM = require('../controllers/web/telegram');

const body = express.urlencoded({ extended: false });
const router = express.Router();
router.post('/tg', body, TELEGRAM.webhookAssistant);

module.exports = router;
