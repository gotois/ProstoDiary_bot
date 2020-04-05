const express = require('express');
const Marketplace = require('../controllers/web/assistants');

const router = express.Router();
const marketplace = new Marketplace();
router.get('/', marketplace.assistants);

module.exports = router;
