const express = require('express');
const jsonParser = require('body-parser').json();
const { TELEGRAM } = require('../../environment');
const TelegramController = require('../controllers/web/telegram');

const router = express.Router();
router.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, TelegramController.webhookAPI);

module.exports = router;
