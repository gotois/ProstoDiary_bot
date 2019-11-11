const jsonrpc = require('../core/jsonrpc');

module.exports = (request, response, next) => {
  console.log(request);
  jsonrpc.server.call(request.body, { user: request.user }, (error, result) => {
    if (error) {
      return next(error);
    }
    response.send(result);
  });
};
