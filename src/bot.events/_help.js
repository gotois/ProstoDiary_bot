const bot = require('./../bot.config.js');
/***
 *
 * @param msg {Object}
 * @return {void}
 */
function onHelp(msg) {
  const data = {
    '/download': 'Загрузка файла с данными',
    '/dbclear': 'Удаление БД',
    '/graph': 'Построение графиков',
    '/get 1.12.2016': 'Получение данных за этот срок',
    '/set 31.01.2016': 'Добавление данных за этот срок'
  };
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, JSON.stringify(data, null, 2));
}

module.exports = onHelp;
