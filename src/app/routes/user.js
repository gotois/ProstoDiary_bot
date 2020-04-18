const express = require('express');
const basic = require('../middlewares/auth-user');
const passportController = require('../controllers/web/passport');

const router = express.Router();
// JSON-LD пользователя/организации - deprecated?
router.get('/:uuid/date/:date', basic.check(passportController));

module.exports = router;
