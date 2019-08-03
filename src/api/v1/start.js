const dbUsers = require('../../database/users.database');
const Story = require('../../services/story.service');

module.exports = async (
  langCode,
  first_name,
  currentUser,
  date,
  telegram_message_id,
) => {
  let startMessage;
  if (langCode === 'en') {
    startMessage = 'INSTALL EN Bot for ' + first_name;
  } else if (langCode === 'ru') {
    startMessage = 'INSTALL RU Bot for ' + first_name;
  } else {
    throw new TypeError('Wrong langCode');
  }
  const { rowCount } = await dbUsers.exist(currentUser.id);
  if (rowCount > 0) {
    return {
      jsonrpc: '2.0',
      result: 'Повторная установка не требуется',
    };
  }
  const story = new Story({
    text: startMessage,
    date,
    currentUser,
    telegram_message_id,
    intent: 'install',
  });
  await story.save();
  // todo: выводить оферту
  // ...
  // todo: задавать пароль, который будет нужен для crypto
  // ...
  return {
    jsonrpc: '2.0',
    result: 'Вы вошли в систему',
  };
};
