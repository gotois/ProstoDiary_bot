const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const { setJWT } = require('../../libs/database.cjs');

const { GIC_AUTH, GIC_USER, GIC_PASSWORD } = process.env;

/**
 * @description Ассистент детектирует пользователя
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('auth activity', activity);

  // WIP - по возможности отправлять профиль пользователя при регистрации
  // const profilePhotos = await bot.getUserProfilePhotos(message.chat.id)

  const { result, error } = await requestJsonRpc2({
    url: GIC_AUTH,
    body: {
      id: uuidv1(),
      method: 'registration',
      params: activity,
    },
    auth: {
      user: GIC_USER,
      pass: GIC_PASSWORD,
    },
  });
  await bot.deleteMessage(message.chat.id, message.message_id);
  if (error) {
    console.error(error);
    return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
      parse_mode: 'MarkdownV2',
      message_effect_id: '5046589136895476101', // 💩
    });
  }
  setJWT(Number(message.chat.id), result);

  const string_ = `
**Успешно зарегистрированы** ✅

Отправь мне войс, текст или картинку и я добавлю это событие в твой календарь!

Например:
**"💈Напомни завтра о барбершопе в 9:00 на Бауманской"**
**"📆В это воскресенье будет митап"**
**"💧Мне важно пить 2 литра воды в день ежедневно"**
`;
  await bot.sendMessage(message.chat.id, string_, {
    parse_mode: 'MarkdownV2',
    message_effect_id: '5046509860389126442', // 🎉
  });
};
