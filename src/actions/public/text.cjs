const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);
  const accept = 'text/calendar';

  switch (queryResult.intent.displayName) {
    case 'OrganizeAction': {
      await bot.sendMessage(message.chat.id, queryResult.fulfillmentText, {
        reply_to_message_id: message.message_id,
        disable_notification: false,
        disable_web_page_preview: true,
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [
              {
                text: 'Подтвердить',
                callback_data: 'approve_event',
              },
            ],
          ],
        },
      });
      break;
    }
    default: {
      break;
    }
  }
};
