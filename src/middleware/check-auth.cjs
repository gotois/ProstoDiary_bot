const { LangChainYandexGPT } = require('langchain-yandexgpt');
const tzlookup = require('@photostructure/tz-lookup');
const errorHandler = require('./error-handler.cjs');
const { getUsers, deleteUser, updateUserLocation } = require('../models/users.cjs');
const Dialog = require('../libs/dialog.cjs');
const { SERVER } = require('../environments/index.cjs');
const cities = require('cities.json');

/**
 * @param {Function} callback - callback
 * @returns {(function(*, *): void)}
 */
module.exports = function (callback) {
  return async (bot, message) => {
    const { chat, text } = Array.isArray(message) ? message[0] : message;
    const [user] = getUsers(chat.id);

    if (!user) {
      await bot.sendMessage(chat.id, 'Пройдите авторизацию нажав /start', {
        parse_mode: 'MarkdownV2',
      });
      return;
    }
    if (!user.location) {
      const cityName = text.toLowerCase();
      const city = cities.find((city) => {
        return city.name.toLowerCase() === cityName;
      });

      if (city) {
        const timezone = tzlookup(city.lat, city.lng);
        await updateUserLocation(chat.id, {
          timezone,
          latitude: city.lat,
          longitude: city.lng,
        });
        const data = `Ваша таймзона: ${timezone}.\nДля завершения регистрации требуется подтвердить свой номер телефона`;
        await bot.sendMessage(chat.id, data, {
          reply_markup: {
            remove_keyboard: true,
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [
              [
                {
                  // request_contact может работать только в таком виде
                  text: '📞 Отправить контакт',
                  request_contact: true,
                },
              ],
            ],
          },
        });
      }
    }

    // todo если использовать inline тогда
    if (message.via_bot) {
      console.log('WIP supports: ', message.via_bot);
    }

    const model = new LangChainYandexGPT({
      temperature: 0,
      apiKey: process.env.YC_API_KEY,
      folderID: process.env.YC_IAM_TOKEN,
      model: 'yandexgpt-lite',
    });
    const secretaryAI = new SecretaryAI.default(SERVER.HOST + '/mcp', model, user.language);

    if (user.jwt) {
      try {
        await secretaryAI.connect('secretary-mcp-server', {
          Authorization: user.jwt,
        });
      } catch (error) {
        if (error.code === 401) {
          deleteUser(chat.id);
          await bot.sendMessage(chat.id, 'Пройдите авторизацию заново нажав /start', {
            parse_mode: 'MarkdownV2',
          });
          return;
        }
        console.error('Ошибка подключения к MCP:', error);
      }
    }

    await errorHandler(callback)(bot, message, Dialog.from(user), secretaryAI);
  };
};
