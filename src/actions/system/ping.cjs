const Dialog = require('../../libs/dialog.cjs');
const requestJsonRpc2 = require('request-json-rpc2').default;

const { GIC_AUTH, GIC_USER, GIC_PASSWORD } = process.env;

/**
 * Проверка сети
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @return {Promise<void>}
 */
module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);
  const response = await requestJsonRpc2({
    url: GIC_AUTH,
    body: {
      id: dialog.activity.origin.id,
      method: 'ping',
      params: [],
    },
    auth: {
      user: GIC_USER,
      pass: GIC_PASSWORD,
    },
  });
  if (response.error) {
    return bot.sendMessage(message.chat.id, response.error.message, {
      parse_mode: 'markdown',
    });
  } else {
    await bot.sendMessage(message.chat.id, response.result, {
      parse_mode: 'markdown',
    });
  }
};
