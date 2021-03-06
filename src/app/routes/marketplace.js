const express = require('express');
const Marketplace = require('../controllers/web/assistants');

const router = express.Router();
router.get('/', Marketplace.assistants);
router.get('/:id', Marketplace.one);

module.exports = router;
