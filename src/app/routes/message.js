const express = require('express');
const basic = require('../middlewares/auth');
const messageController = require('../controllers/web/message');

const router = express.Router();
router.get('/:uuid', basic.check(messageController));

module.exports = router;
