const express = require('express');
const jsonParser = require('body-parser').json();
const { TELEGRAM } = require('../../environment');
const TelegramController = require('../controllers/web/telegram');
const basic = require('../middlewares/auth-assistants');

const body = express.urlencoded({
  extended: true,
});

const router = express.Router();
router.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, TelegramController.api);
router.post(
  '/hooks/message-processing',
  body,
  basic.check(TelegramController.notifyProcessing),
);
router.post(
  '/hooks/message-inserted',
  body,
  basic.check(TelegramController.notify),
);
router.post(
  '/hooks/message-error',
  body,
  basic.check(TelegramController.notifyError),
);
router.post(
  '/hooks/command-processing',
  body,
  basic.check(TelegramController.notifyProcessing),
);
router.post(
  '/hooks/command-inserted',
  body,
  basic.check(TelegramController.notify),
);
router.post(
  '/hooks/command-error',
  body,
  basic.check(TelegramController.notifyError),
);

module.exports = router;
