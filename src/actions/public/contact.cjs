/**
 * @param {object} activity - activity message
 * @param {object} message - telegram message
 * @param {any} bot - telegram bot
 * @returns {Promise<void>}
 */
module.exports = async (activity, message, bot) => {
  console.log('contact', activity);
  await bot.sendMessage(message.chat.id, 'Contact: ' + JSON.stringify(activity.object), {
    parse_mode: 'MarkdownV2',
  });
};
