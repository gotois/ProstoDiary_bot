/* eslint-disable unicorn/import-index */
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
/* eslint-enable unicorn/import-index */

module.exports = new Client({
  name: 'tg-client',
  version: '1.0.0',
});
