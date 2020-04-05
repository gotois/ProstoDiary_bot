const express = require('express');
const BOT = require('../controllers/web/bot');

const router = express.Router();
const body = express.urlencoded({ extended: false });
router.get('/activate', body, BOT.signin);
router.get('/deactivate', body, BOT.signout);

module.exports = router;
