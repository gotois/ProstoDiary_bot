const express = require('express');
const Documentation = require('../controllers/web/documentation');

const router = express.Router();
router.get('/openapi.json', Documentation.openApi);

module.exports = router;
