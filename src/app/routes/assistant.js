const express = require('express');
const basic = require('../middlewares/auth-assistants');
const TELEGRAM = require('../controllers/web/telegram');

// hack ограничиваем передачу в 1 мб
const body = express.urlencoded({
  extended: true,
  limit: '1mb',
  parameterLimit: 1000,
});
const router = express.Router();
router.post('/tg', body, basic.check(TELEGRAM.webhookAssistant));

module.exports = router;
