const express = require('express');
const basic = require('../middlewares/auth-user');
const MessageController = require('../controllers/web/message');

const router = express.Router();
router.get('/:bot/from/:from/to/:to', basic.check(MessageController.date));
router.get('/:bot/latest/:limit?', basic.check(MessageController.latest));
router.get('/:bot/:uuid/:revision?', basic.check(MessageController.message));
router.get('/:bot/:uuid/raw', basic.check(MessageController.messageRaw));

module.exports = router;
