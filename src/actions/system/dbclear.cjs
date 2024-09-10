/* eslint-disable */
const activitystreams = require('telegram-bot-activitystreams');
// const requestJsonRpc2 = require('request-json-rpc2');

// todo: нужно проверять выгружен ли был бэкап, и если нет - предупреждать пользователя
// Очистить базу данных с подтверждением - Удаление всей истории пользователя целиком
module.exports = async (bot, message) => {
  const { message_id } = await bot.sendMessage(message.chat.id, 'Очистить ваши записи?\nНапишите: YES', {
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    if (text !== 'YES') {
      await bot.sendMessage(message.chat.id, 'Операция отменена пользователем');
      return;
    }
    const activity = activitystreams(message);

    // const result = await requestJsonRpc2({
    //   url: telegram.url,
    //   body: {
    //     id: uuidv1(),
    //     method: "dbclear",
    //     params: {
    //       ...activity,
    //     },
    //   },
    //   // jwt: assistant.token,
    //   // signature: verificationMethod
    //   headers: {
    //     Accept: "application/ld+json",
    //   },
    // });
    // await bot.sendMessage(message.chat.id, result);
  });
};
