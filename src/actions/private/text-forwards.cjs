const requestJsonRpc2 = require('request-json-rpc2').default;
const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');

const { GIC_RPC } = process.env;

module.exports = async (bot, messages, user) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const dialog = new Dialog();
  for (const message of messages) {
    await dialog.push(message);
  }
  const { result, error } = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: dialog.uid,
      method: 'generate-calendar',
      params: dialog.activity,
    },
    jwt: user.jwt,
    headers: {
      'Accept': 'text/calendar',
      'Accept-Language': dialog.language,
    },
  });
  const comp = await generateCalendar({
    activity: dialog.activity,
    jwt: user.jwt,
  });
  const message = messages[0];
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
};
