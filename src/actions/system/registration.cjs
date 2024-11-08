const { setJWT } = require('../../libs/database.cjs');

function registrationSuccessMessage() {
  return `
**Успешно зарегистрированы** ✅

Отправь мне войс, текст или картинку и я добавлю это событие в твой календарь\\!

Например:
**"💈Напомни завтра о барбершопе в 9:00 на Бауманской"**
**"📆В это воскресенье будет митап"**
**"💧Мне важно пить 2 литра воды в день ежедневно"**
`.trim();
}

/**
 * @description Ассистент детектирует пользователя
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @param {string} jwt - Server JWT
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, jwt) => {
  /* todo - перенести в другие модули где требуется получить изображение пользователя
  const profilePhotos = await bot.getUserProfilePhotos(message.chat.id);
  if (profilePhotos.photos.length > 0) {
    const userPicture = await bot.getFileLink(profilePhotos.photos[0][0].file_id);
    activity.actor.image = {
      type: 'Link',
      href: userPicture,
      mediaType: 'image/jpeg',
    };
  }
  */

  try {
    await bot.deleteMessage(message.chat.id, message.message_id);
    setJWT(Number(message.chat.id), jwt);

    await bot.sendMessage(message.chat.id, registrationSuccessMessage(), {
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
