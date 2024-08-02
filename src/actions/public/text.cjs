const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

async function privateDialog(dialog) {
  const [{ queryResult }] = await dialog.text(dialog.message.text);
  dialog.message.from.language_code = queryResult.languageCode;
  switch (queryResult.intent.displayName) {
    case 'OrganizeAction': {
      break;
    }
    default: {
      throw new Error(queryResult.fulfillmentText || 'Попробуйте написать что-то другое');
    }
  }
  if (!queryResult.intent.endInteraction) {
    // todo - если это не финальный интерактив, то продолжать диалог
    //  ...
  }
}

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
  const dialog = new Dialog(message);
  const accept = 'text/calendar';

  if (message.chat.type === 'group') {
    // FIXME - для группы:
    //  следим пока не появится OrganizeAction от одного из участника
    //  слушаем чат до тех пор, пока не появится от другого участника подтверждение или опровержение
    await groupDialog(dialog, bot);
  } else {
    bot.sendChatAction(dialog.message.chat.id, sendPrepareAction(accept));

    try {
      await privateDialog(dialog);
      await generateCalendar(bot, dialog);
    } catch (error) {
      console.error('DialogflowError:', error);
      await bot.setMessageReaction(dialog.message.chat.id, dialog.message.message_id, {
        reaction: JSON.stringify([
          {
            type: 'emoji',
            emoji: '🤷‍♀',
          },
        ]),
      });
      return bot.sendMessage(dialog.activity.target.id, error.message, {
        parse_mode: 'markdown',
        disable_web_page_preview: true,
      });
    }
  }
};
