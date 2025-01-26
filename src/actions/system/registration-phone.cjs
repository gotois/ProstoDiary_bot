const { v1: uuidv1 } = require('uuid');
const requestJsonRpc2 = require('request-json-rpc2').default;
const { pdfToPng } = require('pdf-to-png-converter');
const { setJWT } = require('../../libs/database.cjs');
const { generateTelegramHash } = require('../../libs/tg-crypto.cjs');
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
    console.warn(error);
  }
  const response = await fetch(SERVER_HOST + '/authorization', {
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
  // делаем запрос на оферту
  const me = await bot.getMe();
  const photos = await bot.getUserProfilePhotos(me.id);
  const photo = photos.photos?.[0]?.[0]?.file_id;
  const file = await bot.getFile(photo);
  const botPhotoLink = await bot.getFileLink(file.file_id);
  const { result, error } = await requestJsonRpc2({
    url: SERVER_HOST + '/rpc',
    body: {
      id: uuidv1(),
      method: 'offerta',
      params: {
        url: botPhotoLink,
      },
    },
    jwt: jwt,
    headers: {
      'Accept-Language': message.from.language_code,
    },
  });
  if (error) {
    throw new Error('Произошла ошибка JSON-RPC');
  }
  // Превращаем PDF в PNG
  const response1 = await fetch(result.credentialSubject.object.attachment[0].url);
  const fileBuffer = await response1.arrayBuffer();
  const pngPages = await pdfToPng(Buffer.from(fileBuffer));
  await bot.sendPhoto(message.chat.id, pngPages[0].content, {
    caption: result.credentialSubject.object.attachment[0].name,
    parse_mode: 'HTML',
    filename: pngPages[0].name,
    contentType: 'image/png',
  });
  await bot.deleteMessage(message.chat.id, message.message_id);
  setJWT(Number(message.chat.id), jwt);
  await bot.sendMessage(message.chat.id, 'Вы авторизованы!', {
    parse_mode: 'MarkdownV2',
    message_effect_id: '5046509860389126442', // 🎉
    reply_markup: {
      remove_keyboard: true,
    },
  });
};
