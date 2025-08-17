const { pdfToPng } = require('pdf-to-png-converter');
const { setJWT, setLanguage } = require('../../models/users.cjs');
const { generateTelegramHash } = require('../../libs/tg-crypto.cjs');
const { sendPrepareAction, UPLOAD_DOCUMENT } = require('../../libs/tg-messages.cjs');
const { SERVER } = require('../../environments/index.cjs');

/**
 * @description Ассистент детектирует пользователя
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @param {any} dialog - dialog
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, dialog) => {
  if (!dialog.user.location) {
    throw new Error('Unknown location');
  }
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
      body.photo_url = await bot.getFileLink(profilePhotos.photos[0][0].file_id);
    }
  } catch (error) {
    console.warn(error);
  }
  const response = await fetch(SERVER.HOST + '/users/telegram/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': message.from.language_code,
      'Geolocation': dialog.user.location,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Произошла ошибка ${response.statusText}`);
  }
  const bearerAuth = response.headers.get('Authorization');
  const user = await response.json();
  const responseRegistration = await fetch(SERVER.HOST + `/users/${user.id}/offer`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': message.from.language_code,
      'Geolocation': dialog.user.location,
      'Authorization': bearerAuth,
    },
  });
  if (!responseRegistration.ok) {
    throw new Error(`Ошибка регистрации: ${responseRegistration.statusText}`);
  }
  const registrationResult = await responseRegistration.json();
  const [url] = registrationResult.credentialSubject.object.attachment;
  await sendPrepareAction(bot, message, UPLOAD_DOCUMENT);
  const responseDocument = await fetch(url);
  const fileBuffer = await responseDocument.arrayBuffer();
  const pngPages = await pdfToPng(Buffer.from(fileBuffer));
  await bot.sendMediaGroup(
    message.chat.id,
    pngPages.map((page) => {
      return {
        type: 'photo',
        media: page.content,
        width: page.width,
        height: page.height,
        caption:
          page.pageNumber === 1
            ? 'Вы зарегистрированы!\nПродолжая использовать сервис вы принимаете условия пользовательского соглашения.'
            : undefined,
      };
    }),
    {
      disable_notification: true,
      message_effect_id: '5046509860389126442', // 🎉
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [],
      },
    },
  );
  setJWT(message.chat.id, bearerAuth);
  setLanguage(message.chat.id, message.from.language_code);
  await bot.deleteMessage(message.chat.id, message.message_id);
};
