const { deleteUser } = require('../../models/users.cjs');

/**
 * Очистить базу данных с подтверждением - Удаление всей истории пользователя целиком
 * @param bot
 * @param {object} message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const { message_id } = await bot.sendMessage(message.chat.id, 'Очистить ваши записи?\nНапишите: YES', {
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    if (text !== 'YES') {
      await bot.sendMessage(message.chat.id, 'Операция отменена пользователем', {
        reply_markup: {
          remove_keyboard: true,
          selective: false,
        },
      });
      return;
    }

    deleteUser(message.user.id);
    await bot.sendMessage(message.chat.id, 'Ваша история была удалена');
  });
};
