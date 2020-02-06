const jayson = require('jayson/promise');
const API = require('./v4');

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
