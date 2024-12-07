const Dialog = require('../../libs/dialog.cjs');
const { setJWT } = require('../../libs/database.cjs');
const { sentToSecretary } = require('../../controllers/generate-calendar.cjs');

/**
 * @description Ассистент детектирует пользователя
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @param {string} jwt - Server JWT
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, jwt) => {
  try {
    await bot.deleteMessage(message.chat.id, message.message_id);
    setJWT(Number(message.chat.id), jwt);

    const dialog = new Dialog();
    dialog.push(message);
    dialog.activity.summary = 'привет';
    const { data, type } = await sentToSecretary({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: jwt,
      language: dialog.language,
    });
    console.log('data', data);
    console.log('type', type);
    await bot.sendMessage(message.chat.id, data, {
      parse_mode: 'MarkdownV2',
      message_effect_id: '5046509860389126442', // 🎉
      reply_markup: {
        remove_keyboard: true,
      },
    });
  } catch (error) {
    console.error(error);
    return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
      parse_mode: 'MarkdownV2',
      message_effect_id: '5046589136895476101', // 💩
    });
  }
};
