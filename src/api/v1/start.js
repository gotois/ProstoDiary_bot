const dbUsers = require('../../database/users.database');
const Story = require('../../services/story.service');

module.exports = async (
  langCode,
  first_name,
  currentUser,
  telegram_message_id,
) => {
  let startMessage;
  // todo: этот текст должне быть в интенте - InstallIntent
  if (langCode === 'en') {
    startMessage = 'INSTALL_EN_BOT ' + first_name;
  } else if (langCode === 'ru') {
    startMessage = 'INSTALL_RU_BOT ' + first_name;
  } else {
    throw new TypeError('Wrong langCode');
  }
  const { rowCount } = await dbUsers.exist(currentUser.id);
  if (rowCount > 0) {
    return 'Повторная установка не требуется';
  }
  const story = new Story({
    text: startMessage,
    date: null, // todo: вставлять время telegram
    currentUser,
    telegram_message_id,
  });
  await story.fill();
  // todo: здесь должна быть проверка на валидность введенных данных
  // ...
  await story.save();
  return 'Вы вошли в систему';
};
