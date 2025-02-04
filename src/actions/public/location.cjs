const tzlookup = require('@photostructure/tz-lookup');
const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { updateUserLocation } = require('../../libs/database.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  await sendPrepareMessage(bot, message);
  if (!user.jwt) {
    const timezone = tzlookup(message.location.latitude, message.location.longitude);
    await updateUserLocation(message.chat.id, {
      timezone,
      latitude: message.location.latitude,
      longitude: message.location.longitude,
    });
    const data = `Твоя таймзона: ${timezone}.\nДля завершения регистрации требуется указать свой номер телефона`;
    await bot.sendMessage(message.chat.id, data, {
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [
            {
              // request_contact может работать только в таком виде
              text: '📞 Отправить контакт',
              request_contact: true,
            },
          ],
        ],
      },
    });
    return;
  }
  const { message_id } = await bot.sendMessage(message.chat.id, 'Напиши свои намерения', {
    reply_to_message_id: message.message_id,
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    message.location.caption = text;
    try {
      await sendPrepareMessage(bot, message);
      const dialog = new Dialog(user);
      dialog.push(message);
      const { data, type } = await generateCalendar(dialog);
      await sendPrepareMessage(bot, message);
      switch (type) {
        case 'text/markdown': {
          await bot.sendMessage(message.chat.id, data, {
            parse_mode: 'MarkdownV2',
            reply_to_message_id: message.message_id,
            protect_content: true,
          });
          break;
        }
        case 'text/plain': {
          await bot.sendMessage(message.chat.id, data, {
            reply_to_message_id: message.message_id,
            protect_content: true,
          });
          break;
        }
        default: {
          throw new Error('Unknown type ' + type);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};
