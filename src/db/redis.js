const Redis = require('ioredis');
const { REDIS } = require('../environment');

const client = new Redis(REDIS.URL, {
  keyPrefix: 'oidc:',
});

module.exports = client;
