const express = require('express');
const TELEGRAM = require('../controllers/web/telegram');

const body = express.urlencoded({ extended: true });
const router = express.Router();
// fixme нужна защита, чтобы проверять действительность передачи ассистентов
router.post('/tg', body, TELEGRAM.webhookAssistant);

module.exports = router;
