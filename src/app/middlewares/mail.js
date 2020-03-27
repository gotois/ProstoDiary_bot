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
          await require('../controllers/email/delivered')(info);
          break;
        }
        default: {
          break;
        }
      }
    }
  } catch (error) {
    next(error);
  } finally {
    response.sendStatus(200);
  }
};
