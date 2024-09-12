const { v1: uuidv1 } = require('uuid');
const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');

const { GIC_AUTH, GIC_USER, GIC_PASSWORD } = process.env;

/**
 * Проверка сети
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const response = await requestJsonRpc2({
    url: GIC_AUTH,
    body: {
      id: uuidv1(),
      method: 'ping',
      params: activitystreams(message),
    },
    auth: {
      user: GIC_USER,
      pass: GIC_PASSWORD,
    },
  });
  // eslint-disable-next-line unicorn/prefer-ternary
  if (response.error) {
    return bot.sendMessage(message.chat.id, response.error.message, {
      parse_mode: 'markdown',
    });
  } else {
    return bot.sendMessage(message.chat.id, response.result, {
      parse_mode: 'markdown',
    });
  }
};
