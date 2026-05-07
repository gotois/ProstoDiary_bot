/**
 * @param {any} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (activity, message, bot) => {
  console.log('contact', activity);
  await bot.sendMessage(message.chat.id, 'Contact: ' + JSON.stringify(activity.object), {
    parse_mode: 'MarkdownV2',
  });
};
