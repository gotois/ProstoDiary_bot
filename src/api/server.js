const jayson = require('jayson/promise');
const API = require('./v4/public');

const server = jayson.server(
  {
    ...API,
  },
  {
    useContext: true,
    params: Object,
  },
);

module.exports = server;
