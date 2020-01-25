const jayson = require('jayson/promise');
const API = require('../api/v3');

const server = jayson.server(
  {
    ...API,
  },
  {
    useContext: true,
    params: Object,
  },
);

const client = jayson.client(server);

const rpcRequest = (method, parameters, passport) => {
  return new Promise((resolve, reject) => {
    server.call(
      {
        jsonrpc: '2.0',
        id: 1, // todo изменить используя guid ?
        method,
        params: parameters,
      },
      {
        passport,
      },
      (error, result) => {
        if (error) {
          return reject(error.error);
        }
        return resolve(result.result);
      },
    );
  });
};

module.exports = {
  client,
  server,
  rpcRequest,
};
