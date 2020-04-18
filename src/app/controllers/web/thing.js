// const { sql, pool } = require('../../../db/sql');

module.exports = (request, response) => {
  try {
    const { name } = request.params;
    // fixme получать content по идентификатору uid
    const content = null;
    const contentType = 'text/plain'; // fixme хардкод для теста
    switch (contentType) {
      case 'text/plain':
      case 'plain/text': {
        response.status(200).send(name);
        break;
      }
      case 'image/jpeg': {
        response
          .status(200)
          .send(
            `<img src="data:image/jpeg;base64, ${content.toString(
              'base64',
            )}"/>`,
          );
        break;
      }
      default: {
        throw new Error('Unknown mime');
      }
    }
  } catch (error) {
    response.status(400).json({
      error: error.message,
    });
  }
};
