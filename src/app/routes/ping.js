const express = require('express');
const pingController = require('../controllers/web/ping');
const basic = require('../middlewares/auth');

const router = express.Router();
router.get('/', basic.check(pingController));

module.exports = router;
