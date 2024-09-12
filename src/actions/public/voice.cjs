const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');
const { executeAtTime } = require('../../libs/execute-time.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  try {
    await dialog.push(message);
  } catch (error) {
    console.error('DialogflowError:', error);
    return bot.sendMessage(message.chat.id, 'Ошибка. Голос нераспознан', {
      parse_mode: 'markdown',
    });
  }
  try {
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '✍',
        },
      ]),
    });
    const comp = await generateCalendar({
      activity: dialog.activity,
      jwt: user.jwt,
    });
    await bot.sendMessage(message.chat.id, formatCalendarMessage(comp, dialog.language), {
      parse_mode: 'markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Скачать',
              callback_data: 'send_calendar',
            },
          ],
        ],
      },
    });

    // todo - перенести это в SQL DataBase
    const vevent = comp.getFirstSubcomponent('vevent');
    const dtstart = vevent.getFirstPropertyValue('dtstart').toString().replace('Z', '');
    executeAtTime(new Date(dtstart), async () => {
      let task = 'Внимание! У вас есть задача:\n';
      task += vevent.getFirstPropertyValue('summary') + '\n';
      const dateString = new Intl.DateTimeFormat('ru').format(
        new Date(vevent.getFirstPropertyValue('dtstart').toString()),
      );
      task += dateString + '\n';

      await bot.sendMessage(message.chat.id, task, {
        parse_mode: 'markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Напомнить через 15 мин',
                callback_data: 'notify_calendar--15',
              },
            ],
            [
              {
                text: 'Напомнить через 1 час',
                callback_data: 'notify_calendar--60',
              },
            ],
            [
              {
                text: 'Напомнить завтра',
                callback_data: 'notify_calendar--next-day',
              },
            ],
          ],
        },
      });
    });
  } catch (error) {
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '👾',
        },
      ]),
    });
    return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
      parse_mode: 'markdown',
    });
  }
};
