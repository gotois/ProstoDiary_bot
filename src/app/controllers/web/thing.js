module.exports = (request, response, next) => {
  try {
    // todo https://github.com/gotois/ProstoDiary_bot/issues/511
    response.status(200).json('ok');
  } catch (error) {
    next(error);
  }
};
