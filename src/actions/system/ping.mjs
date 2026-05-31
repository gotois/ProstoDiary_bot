import env from '../../environments/index.mjs';

const { SECRETARY } = env;

/**
 * @description Проверка сети
 * @param {object} activity - activity
 * @param {object} message - telegram message
 * @param {object} bot - telegram bot
 * @returns {Promise<void>}
 */
export default async (activity, message, bot) => {
  const response = await fetch(SECRETARY.HOST + '/health?service=redis', {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  if (!response.ok) {
    throw new Error(`Произошла ошибка ${response.statusText}`);
  }
  const result = await response.text();
  return bot.sendMessage(message.chat.id, result, {
    parse_mode: 'MarkdownV2',
  });
};
