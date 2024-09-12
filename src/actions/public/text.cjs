const Dialog = require('../../libs/dialog.cjs');

async function groupDialog(dialog, bot) {
  const [{ queryResult }] = await dialog.text(dialog.message.text);
  dialog.message.from.language_code = queryResult.languageCode;
  switch (queryResult.intent.displayName) {
    case 'OrganizeAction': {
      await bot.sendMessage(dialog.message.chat.id, queryResult.fulfillmentText, {
        reply_to_message_id: dialog.message.message_id,
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
}

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);
  const accept = 'text/calendar';

  await groupDialog(dialog, bot);
};
