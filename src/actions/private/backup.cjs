// const requestJsonRpc2 = require('request-json-rpc2');
const { v1: uuidv1 } = require('uuid');

/**
 * @description Выгрузка бэкапа - скачивание всей переписки на устройство
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  // const { result } = await requestJsonRpc2({
  //   url: url,
  //   body: {
  //     id: uuidv1(),
  //     method: "backup",
  //   },
  //   // jwt: assistant.token,
  //   // signature: verificationMethod
  //   headers: {
  //     Accept: "application/ld+json",
  //   },
  //   // jwt: assistant.token, // todo использовать
  //   // signature: verificationMethod // todo использовать
  // });
  //   const authMessage = await this.bot.sendMessage(
  //     this.message.chat.id,
  //     'Введите ключ двухфакторной аутентификации',
  //     {
  //       parse_mode: 'Markdown',
  //       reply_markup: {
  //         force_reply: true,
  //       },
  //     },
  //   );
  // --запрашиваем 2FA: ключ от двухфакторной аутентификации--
  //   bot.onReplyToMessage(message.chat.id, authMessage.message_id, ({ text }) => {});
  //
  //   await Promise.all(
  //     attachments.map((attachment) => {
  //       return bot.sendDocument(
  //         chatId,
  //         Buffer.from(attachment.content, 'base64'),
  //         {
  //           caption: subject,
  //           parse_mode: parseMode,
  //           disable_notification: true,
  //         },
  //         {
  //           filename: attachment.filename,
  //           contentType: attachment.type,
  //         },
  //       );
  //     }),
  //   );
};
