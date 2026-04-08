const { json } = require('node:stream/consumers');

module.exports = async function (request, response, next) {
  const rawContentType = request?.headers['content-type'] ?? request?.get('content-type') ?? '';
  const contentType = String(rawContentType).split(';')[0].trim().toLowerCase();

  if (contentType !== 'application/vc+ld+json') {
    return next();
  }

  try {
    const bodyObject = await json(request);
    request.body = bodyObject ?? {};
    next();
  } catch (error) {
    console.error('Не удалось использовать node:stream/consumers:', error && error.message ? error.message : error);
    next(error);
  }
};
