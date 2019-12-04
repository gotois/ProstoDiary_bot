/**
 * @param {object} request - request
 * @param {object} response - response
 * @param {Function} next - callback
 * @returns {Promise<undefined>}
 */
module.exports = async (request, response, next) => {
  try {
    for (const info of request.body) {
      switch (info.event) {
        case 'processed': {
          await require('../controllers/email/processed')(info);
          break;
        }
        case 'open': {
          await require('../controllers/email/open')(info);
          break;
        }
        case 'spamreport': {
          await require('../controllers/email/spamreport')(info);
          break;
        }
        case 'unsubscribe': {
          await require('../controllers/email/unsubscribe')(info);
          break;
        }
        case 'delivered': {
          break;
        }
        default: {
          break;
        }
      }
    }
    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
