const express = require('express');
const basic = require('../middlewares/auth-assistants');
const TELEGRAM = require('../controllers/web/telegram');

const body = express.urlencoded({ extended: true });
const router = express.Router();
router.post('/tg', body, basic.check(TELEGRAM.webhookAssistant));

module.exports = router;
