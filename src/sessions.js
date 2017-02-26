// TODO: https://github.com/tewst/ProstoDiary_bot/issues/1
/*let sessions = [{
  userId: 777,
  password: 'test'
}];*/
/**
 * @todo return sessions.find(session => session.userId === userId);
 * @param userId {String}
 * @return {{id: String, password: string}}
 */
function getSession(userId) {
  return {
    id: userId,
    password: '123456'
  };
}

module.exports = {
  getSession
};
