/* eslint-disable max-len */
const { pdfToPng } = require('pdf-to-png-converter');
const { setJWT } = require('../../models/users.cjs');
const { generateTelegramHash } = require('../../libs/tg-crypto.cjs');
const { sendPrepareAction, UPLOAD_DOCUMENT } = require('../../libs/tg-messages.cjs');
const { SERVER } = require('../../environments/index.cjs');

/**
 * @description Ассистент детектирует пользователя
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  await bot.deleteMessage(message.chat.id, message.message_id);
  const waitingMessage = await bot.sendMessage(message.chat.id, '⏳ Идет авторизация...', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
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
    // пробуем добавить в запрос фото профиля
    const profilePhotos = await bot.getUserProfilePhotos(message.chat.id);
    if (profilePhotos.photos.length > 0) {
      body.photo_url = await bot.getFileLink(profilePhotos.photos[0][0].file_id);
    }
  } catch (error) {
    console.warn(error);
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Timezone', message.user.timezone);
  const response = await fetch(SERVER.HOST + '/auth/telegram/oauth', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Ошибка регистрации: ${response.statusText}`);
  }
  const registrationSubject = await response.json();
  await sendPrepareAction(bot, message, UPLOAD_DOCUMENT);
  const [url] = registrationSubject.object.attachment;
  const responseDocument = await fetch(url);
  const fileBuffer = await responseDocument.arrayBuffer();
  const pngPages = await pdfToPng(Buffer.from(fileBuffer));
  const data = pngPages.map((page) => {
    return {
      type: 'photo',
      media: page.content,
      width: page.width,
      height: page.height,
      caption:
        page.pageNumber === 1
          ? 'Вы зарегистрированы!\n' +
            'Продолжая использование сервиса Вы принимаете условия пользовательского Лицензионного соглашения /licence.'
          : undefined,
    };
  });
  await bot.sendMediaGroup(message.chat.id, data, {
    disable_notification: true,
    message_effect_id: '5046509860389126442', // 🎉
    protect_content: true,
    reply_markup: {
      keyboard: [],
    },
  });
  await bot.deleteMessage(message.chat.id, waitingMessage.message_id);
  setJWT(message.user.id, response.headers.get('Authorization'));
};
