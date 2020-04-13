const express = require('express');
const basic = require('../middlewares/auth-user');
const passportController = require('../controllers/web/passport');
const thingController = require('../controllers/web/thing');

const router = express.Router();
// JSON-LD пользователя/организации - deprecated?
router.get('/:uuid/:date', basic.check(passportController));
router.get('/:uuid/:thing', basic.check(thingController));

module.exports = router;
