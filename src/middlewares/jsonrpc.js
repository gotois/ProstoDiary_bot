module.exports = (request, response, next) => {
  const jsonrpc = require('./jsonrpc');

  console.log('kjkjlj')
  jsonrpc.server.call(request.body, { user: request.user }, (error, result) => {
    if (error) {
      return next(error);
    }
    response.send(result);
  });
};
