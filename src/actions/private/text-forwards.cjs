const Dialog = require('../../libs/dialog.cjs');
const {
  generateCalendar,
  formatCalendarMessage,
  formatGoogleCalendarUrl,
} = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const { sendPrepareMessage, sendCalendarMessage, sendTaskMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages, user) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const [message] = messages;
  try {
    const dialog = new Dialog();
    for (const message of messages) {
      await sendPrepareMessage(bot, message);
      dialog.push(message);
    }
    const ical = await generateCalendar({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
    });
    const output = formatCalendarMessage(ical, dialog.language);
    const googleCalendarUrl = formatGoogleCalendarUrl(ical);
    const calendarMessage = await sendCalendarMessage(bot, message, output, googleCalendarUrl);
    await saveCalendar(calendarMessage.message_id, user.key, ical);
    const { text, url } = await notify(ical);
    await sendTaskMessage(bot, calendarMessage, text, url);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(message.chat.id, '👾', {
      disable_web_page_preview: true,
    });
    await bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
      disable_web_page_preview: true,
    });
  }
};
