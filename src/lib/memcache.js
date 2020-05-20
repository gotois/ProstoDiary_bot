const memjs = require('memjs');
const { MEMCACHIER } = require('../environment');

const mc = memjs.Client.create(MEMCACHIER.MEMCACHIER_SERVERS, {
  failover: true, // default: false
  timeout: 1, // default: 0.5 (seconds)
  keepAlive: true, // default: false
});

module.exports = mc;
