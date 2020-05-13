const express = require('express');
const basic = require('../middlewares/auth-user');
const thingController = require('../controllers/web/thing');

const router = express.Router();
router.get('/:creator/:name', basic.check(thingController));

module.exports = router;
