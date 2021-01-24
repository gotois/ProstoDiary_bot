const Redis = require('ioredis');
const { REDIS } = require('../environment');

const client = new Redis(REDIS.URL, {
  keyPrefix: '',
});

module.exports = client;
