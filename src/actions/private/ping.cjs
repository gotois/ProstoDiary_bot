const requestJsonRpc2 = require('request-json-rpc2');
const { v1: uuidv1 } = require('uuid');

// Проверка сети
module.exports = async (bot, message) => {
  bot.sendChatAction(message.chat.id, "typing");

  // const { result } = await requestJsonRpc2({
  //   url: url,
  //   body: {
  //     id: uuidv1(),
  //     method: 'hello',
  //     params: activitystreams(message),
  //   },
  //   headers: {
  //     Accept: 'text/markdown',
  //   },
  //   // jwt: assistant.token, // todo использовать
  //   // signature: verificationMethod // todo использовать
  // });
  // await bot.sendMessage(message.chat.id, result, {
  //   parse_mode: 'Markdown',
  // },);
};
