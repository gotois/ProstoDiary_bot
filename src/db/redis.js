const Redis = require('ioredis');
const { REDIS } = require('../environment');

const client = new Redis({
  ...REDIS,
  maxRetriesPerRequest: null,
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true; // or `return 1;`
    }
  },
}, {
  keyPrefix: '',
});

module.exports = client;
