module.exports = (request, response, next) => {
  response.set('Pragma', 'no-cache');
  response.set('Cache-Control', 'no-cache, no-store');
  next();
};
