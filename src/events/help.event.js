const bot = require('./../config/bot.config.js');
/***
 * @param key {String}
 * @param value {String}
 * @return {void}
 */
const formatResponse = ({key, value}) => {
  return `\n${key}: ${value}`;
};
/**
 * @param msg {Object}
 * @param msg.chat {Object}
 * @return {void}
 */
const onHelp = async ({chat}) => {
  const data = {
    '/download': 'Загрузка файла с данными `/download`',
    '/dbclear': 'Удаление БД `/dbclear YES`',
    '/graph': 'Построение графиков `/graph String|RegExp`',
    '/get': 'Получение данных за этот срок `/get 01.12.2016`',
    '/set': 'Добавление данных за этот срок `/set 31.01.2016 something`',
    '/count': 'Подсчет потраченого `/count -` и полученного `/count +`',
    '/search': 'Поиск вхождения `/search something`',
  };
  const message = Object.keys(data).reduce((acc, val) => (
    acc += formatResponse({key: val, value: data[val]})
  ), '');
  const chatId = chat.id;
  await bot.sendMessage(chatId, message, {
    'parse_mode': 'Markdown'
  });
};

module.exports = onHelp;
