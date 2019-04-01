const bot = require('../bot');
/**
 * @param {Object} obj - object
 * @param {string} obj.key - key
 * @param {string} obj.value - value
 * @returns {string}
 */
const formatResponse = ({ key, value }) => {
  return `\n${key}: ${value}`;
};
/**
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @returns {undefined}
 */
const onHelp = async ({ chat }) => {
  const data = {
    '/download': 'Загрузка файла с данными `/download`',
    '/dbclear': 'Удаление БД `/dbclear YES`',
    '/graph': 'Построение графиков `/graph String|RegExp`',
    '/get': 'Получение данных за этот срок `/get YYYY-MM-DD`',
    '/set': 'Добавление данных за этот срок `/set YYYY-MM-DD something`',
    '/count': 'Подсчет потраченого `/count -` и полученного `/count +`',
    '/search': 'Поиск вхождения `/search something`',
    '/version': 'Получение версии `/version`',
  };
  const message = Object.keys(data).reduce((acc, val) => {
    acc += formatResponse({ key: val, value: data[val] });
    return acc;
  }, '');
  const chatId = chat.id;
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
  });
};

module.exports = onHelp;
