const express = require('express');
const passportController = require('../controllers/web/passport');
const basic = require('../middlewares/auth-user');

const router = express.Router();
router.get('/:user', basic.check(passportController));

module.exports = router;
