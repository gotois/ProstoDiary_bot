const { TELEGRAM_MINI_APP_URL } = require('../../environments/index.cjs');

module.exports = async (bot, message) => {
  console.log('start pomodoro timer', message);
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '👀',
      },
    ]),
  });
  // todo - запустить таймер помодоро на 25 мин - сфокусироваться на выполнении
  // ...
  const editMessage = await bot.editMessageText(message.text, {
    chat_id: message.chat.id,
    message_id: message.message_id,
    // parse_mode: 'MarkdownV2',
    protect_content: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Завершить',
            url: TELEGRAM_MINI_APP_URL,
          },
        ],
      ],
    },
  });
};
