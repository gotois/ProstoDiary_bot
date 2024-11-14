const { TELEGRAM_MINI_APP, IS_DEV } = require('../../environments/index.cjs');
const { getUsers } = require('../../libs/database.cjs');

function getWelcomeText() {
  return (
    '**Привет\\! 👋**\n\n' +
    'Я \\- __ваш персональный календарный бот__, ' +
    'и я здесь, чтобы помочь вам управлять своим временем и задачами\\. ' +
    'Вот что я могу для вас сделать:\\.\n\n' +
    '📅 Создание и управление событиями\n\n' +
    '⏰ Напоминания о важных встречах и делах\n\n' +
    '🔄 Синхронизация с другими календарями\n\n' +
    '📊 Анализ вашего расписания\n\n' +
    'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence\\.\n'
  ).trim();
}

function getInstallAgainText() {
  return (
    '**Требуется повторная установка**\n\n' +
    'Предоставь свои контакты заново, чтобы продолжить пользоваться сервисом\\.\n\n' +
    'Узнай больше подробностей командой /help\\.\n' +
    'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence\\.\n'
  ).trim();
}

/**
 * Начало работы
 * @description request_contact может работать только в таком виде
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  let webAppUrl = `${TELEGRAM_MINI_APP}/tutorial?lang=${message.from.language_code}`;
  // eslint-disable-next-line unicorn/consistent-destructuring
  if (IS_DEV) {
    webAppUrl += '&debug=1';
  }
  const existUser = getUsers(message.chat.id)?.length > 0;
  if (!existUser) {
    await bot.sendMessage(message.chat.id, getInstallAgainText(), {
      parse_mode: 'MarkdownV2',
      disable_notification: true,
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: 'Принимаю лицензионное соглашение',
              request_contact: true,
            },
          ],
        ],
      },
    });
  } else {
    /* uncomment in prod
    const me = await bot.getMe();
    const photos = await bot.getUserProfilePhotos(me.id);
    const photo = photos.photos?.[0]?.[0]?.file_id;
    const file = await bot.getFile(photo);
    const fileBuffer = await bot.getFileStream(file.file_id);
    await bot.sendPhoto(message.chat.id, fileBuffer, {
      caption: 'Hello',
      parse_mode: 'HTML',
      filename: 'hello',
      contentType: 'image/png',
    });
    */
    bot.sendMessage(message.chat.id, getWelcomeText(), {
      parse_mode: 'MarkdownV2',
      disable_notification: true,
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: 'Авторизоваться',
              web_app: { url: webAppUrl },
            },
          ],
        ],
      },
    });
  }
};
