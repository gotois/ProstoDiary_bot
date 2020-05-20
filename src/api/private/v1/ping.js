/**
 * @returns {Promise<string|Error>}
 */
module.exports = function () {
  try {
    return Promise.resolve('Pong');
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
