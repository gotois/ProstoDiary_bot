const express = require('express');
const jsonParser = require('body-parser').json();
const { TELEGRAM } = require('../../environment');
const TelegramController = require('../controllers/web/telegram');

const body = express.urlencoded({
  extended: false,
});

const router = express.Router();
router.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, TelegramController.api);
// todo add basic.check(TelegramController.notify)
router.post(
  '/hooks/message-processing',
  body,
  TelegramController.notifyProcessing,
);
router.post('/hooks/message-inserted', body, TelegramController.notify);
router.post('/hooks/message-error', body, TelegramController.notify);

module.exports = router;
