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
    return 'Повторная установка не требуется';
  }
  const story = new Story({
    text: startMessage,
    date,
    currentUser,
    telegram_message_id,
    intent: 'install',
  });
  await story.save();
  return 'Вы вошли в систему';
};
