const jsonRpcServerPublic = require('../api/public/server');
const jsonRpcServerPrivate = require('../api/private/server');
const RejectAction = require('../action/reject');
/**
 * @param {object} rpcValues - json rpc method
 * @returns {Promise<any>} - document or object
 */
module.exports.private = (rpcValues) => {
  return new Promise((resolve, reject) => {
    jsonRpcServerPrivate.call(rpcValues, {}, (error = {}, result) => {
      if (error && error.error) {
        // todo RejectAction должен формироваться до этого
        return reject(
          jsonRpcServerPublic.error(
            error.error.code,
            error.error.message,
            JSON.stringify(RejectAction(error.error.data)),
          ),
        );
      }
      return resolve(result.result);
    });
  });
};
/**
 * @param {object} rpcValues - json rpc method
 * @param {object} passport - passport
 * @param {object} marketplace - marketplace
 * @returns {Promise<object>} - jsonld
 */
module.exports.public = (rpcValues, passport, marketplace) => {
  return new Promise((resolve, reject) => {
    jsonRpcServerPublic.call(
      rpcValues,
      { passport, marketplace },
      (error = {}, result) => {
        if (error && error.error) {
          // todo RejectAction должен формироваться до этого
          return reject(
            jsonRpcServerPublic.error(
              error.error.code,
              error.error.message,
              JSON.stringify(RejectAction(error.error.data)),
            ),
          );
        }
        return resolve(result.result);
      },
    );
  });
};
