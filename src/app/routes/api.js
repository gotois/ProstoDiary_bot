const express = require('express');
const jsonParser = require('body-parser').json();
const tokenAuth = require('../middlewares/token-auth');
const rpcAPI = require('../controllers/web/jsonrpc');

const router = express.Router();
router.post('*', jsonParser, tokenAuth, rpcAPI);

module.exports = router;
