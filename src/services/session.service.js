// TODO: https://github.com/tewst/ProstoDiary_bot/issues/1
/*let sessions = [{
  userId: 777,
  password: 'test'
}];*/
/**
 * @todo return sessions.find(session => session.userId === userId);
 * @param {string} userId - user id
 * @returns {{id: number, password: string}}
 */
const getSession = (userId) => {
  return {
    id: userId,
    password: '123456',
  };
};

module.exports = {
  getSession,
};
