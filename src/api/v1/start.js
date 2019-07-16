const dbUsers = require('../database/users.database');

module.exports = async (currentUser) => {
  const { rowCount } = await dbUsers.check(currentUser.id);
  if (rowCount === 0) {
    await dbUsers.post(currentUser.id);
    return 'Вы вошли в систему';
  }
  return 'Повторный вход не требуется';
};
