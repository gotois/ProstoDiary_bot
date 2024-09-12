const { getUsers } = require('../../libs/database.cjs');
const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');
const { executeAtTime } = require('../../libs/execute-time.cjs');

module.exports = async (bot, message) => {
  const [user] = getUsers(message.from.id);

  const dialog = new Dialog();
  try {
    await dialog.push(message);
  } catch (error) {
    console.error('DialogflowError:', error);
    return bot.sendMessage(message.chat.id, 'Ошибка. Голос нераспознан', {
      parse_mode: 'markdown',
    });
  }
  await generateCalendar(bot, dialog, user.jwt);
};
