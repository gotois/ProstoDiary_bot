const { setJWT } = require('../../libs/database.cjs');
const Dialog = require('../../libs/dialog.cjs');
const { generateTelegramHash } = require('../../libs/tg-crypto.cjs');
const { sentToSecretary } = require('../../controllers/generate-calendar.cjs');
const { SERVER_HOST } = require('../../environments/index.cjs');

/**
 * @description Ассистент детектирует пользователя
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const body = {
    contact: {
      phoneNumber: message.contact.phone_number,
      firstName: message.contact.first_name,
      lastName: message.contact.last_name,
      userId: message.contact.user_id,
    },
    authDate: message.date * 1000,
    hash: generateTelegramHash({
      auth_date: message.date,
      contact: JSON.stringify(message.contact),
    }),
  };
  try {
    // добавляем в запрос фото профиля
    const profilePhotos = await bot.getUserProfilePhotos(message.chat.id);
    if (profilePhotos.photos.length > 0) {
      const userPicture = await bot.getFileLink(profilePhotos.photos[0][0].file_id);
      body.photo_url = userPicture;
    }
  } catch (error) {
    console.error(error);
  }
  try {
    const response = await fetch(SERVER_HOST + '/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Произошла ошибка');
    }
    const jwt = await response.text();
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
    console.log('type', type);

    await bot.deleteMessage(message.chat.id, message.message_id);
    await bot.sendMessage(message.chat.id, data, {
      parse_mode: 'MarkdownV2',
      message_effect_id: '5046509860389126442', // 🎉
      reply_markup: {
        remove_keyboard: true,
      },
    });
  } catch (error) {
    console.error(error);
    return bot.sendMessage(message.chat.id, error.message, {
      message_effect_id: '5046589136895476101', // 💩
    });
  }
};
