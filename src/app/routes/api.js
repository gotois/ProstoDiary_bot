const express = require('express');
const jsonParser = require('body-parser').json();
const rpcAPI = require('../controllers/web/jsonrpc');

const router = express.Router();
router.post('*', jsonParser, rpcAPI);

module.exports = router;
