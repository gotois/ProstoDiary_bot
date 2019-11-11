const jayson = require('jayson/promise');
const API = require('../api/v3');

const server = jayson.server({
  ...API,
}, {
  useContext: true,
  params: Object,
});
const client = jayson.client(server);

module.exports = {
  client,
  server,
};
