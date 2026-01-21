const { pdfToPng } = require('pdf-to-png-converter');
const { setJWT, setLanguage } = require('../../models/users.cjs');
const { generateTelegramHash } = require('../../libs/tg-crypto.cjs');
const { sendPrepareAction, UPLOAD_DOCUMENT } = require('../../libs/tg-messages.cjs');
const { SERVER } = require('../../environments/index.cjs');

async function bodyFormat(bot, message) {
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
  return body;
}

async function getOffer(user, headers) {
  const response = await fetch(SERVER.HOST + `/users/${user.id}/offer`, {
    method: 'GET',
    headers: {
      ...headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Ошибка регистрации: ${response.statusText}`);
  }
  const registrationResult = await response.json();
  const [url] = registrationResult.credentialSubject.object.attachment;
  const responseDocument = await fetch(url);
  const fileBuffer = await responseDocument.arrayBuffer();
  const pngPages = await pdfToPng(Buffer.from(fileBuffer));

  return pngPages.map((page) => {
    return {
      type: 'photo',
      media: page.content,
      width: page.width,
      height: page.height,
      caption:
        page.pageNumber === 1
          ? 'Вы зарегистрированы!\n' +
            'Продолжая использовать сервис вы принимаете условия пользовательского соглашения /licence.'
          : undefined,
    };
  });
}

/**
 * @description Ассистент детектирует пользователя
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @param {any} dialog - dialog
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, dialog) => {
  if (!dialog.user?.location) {
    throw new Error('Unknown location');
  }
  const waitingMessage = await bot.sendMessage(message.chat.id, '⏳', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
  const body = await bodyFormat(bot, message);
  const response = await fetch(SERVER.HOST + '/auth/telegram/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Geolocation': dialog.user.location,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Произошла ошибка ${response.statusText}`);
  }
  const bearerAuth = response.headers.get('Authorization');
  const user = await response.json();
  await sendPrepareAction(bot, message, UPLOAD_DOCUMENT);
  const offerData = await getOffer(user, {
    'Content-Type': 'application/json',
    'Geolocation': dialog.user.location,
    'Authorization': bearerAuth,
  });
  await bot.deleteMessage(message.chat.id, waitingMessage.message_id);
  await bot.sendMediaGroup(message.chat.id, offerData, {
    disable_notification: true,
    message_effect_id: '5046509860389126442', // 🎉
    reply_markup: {
      keyboard: [],
    },
  });
  setJWT(message.chat.id, bearerAuth);
  setLanguage(message.chat.id, message.from.language_code);
  await bot.deleteMessage(message.chat.id, message.message_id);
};
