const jose = require('jose');
const { pool } = require('../../db/sql');
const passportQueries = require('../../db/selectors/passport');

// Проверяем авторизацию запроса по token auth
module.exports = async (request, response, next) => {
  try {
    if (!request.headers.authorization) {
      throw new Error('Unknown assistant');
    }
    // на данный момент считаем все токены вечными, затем надо будет их валидировать jose.JWT.verify(...)
    const [_basic, id_token] = request.headers.authorization.split(' ');
    const decoded = jose.JWT.decode(id_token);
    const passport = await pool.connect(async (connection) => {
      // todo NotFound exception
      const table = await connection.one(
        passportQueries.selectBotByEmail(decoded.email),
      );
      return table;
    });
    if (!passport) {
      throw new Error('Unauthorized');
    }
    if (!request.session.passport) {
      request.session.passport = {};
    }
    request.session.passport[passport.id] = passport;
    next();
  } catch (error) {
    next(error);
  }
};
