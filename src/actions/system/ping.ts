import env from '../../environments/index.ts';

const { SECRETARY } = env;

/**
 * Проверка сети
 * @param {unknown} activity - активность ActivityPub
 * @param {object} message - сообщение Telegram
 * @param {object} bot - экземпляр бота
 * @returns {Promise<void>} Результат отправки ответного сообщения
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
