const express = require('express');
const basic = require('../middlewares/auth-user');
const MessageController = require('../controllers/web/message');

const router = express.Router();
router.get('/:uuid', basic.check(MessageController.message));
router.get('/:uuid/:revision', basic.check(MessageController.messageRevision));

module.exports = router;
