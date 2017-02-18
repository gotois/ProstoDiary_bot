// TODO: https://github.com/tewst/ProstoDiary_bot/issues/1
let sessions = [{
  userId: 777,
  password: 'test'
}];

function getSession(userId) {
  return {
    id: userId,
    password: '123456'
  };
  // TODO: return sessions.find(session => session.userId === userId);
}

module.exports = {
  getSession
};
