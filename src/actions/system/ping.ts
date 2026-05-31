import env from '../../environments/index.ts';

const { SECRETARY } = env;

/** Проверка сети */
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
