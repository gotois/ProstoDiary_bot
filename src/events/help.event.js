const bot = require('../bot');
/**
 * @param {object} obj - object
 * @param {string} obj.key - key
 * @param {string} obj.value - value
 * @returns {string}
 */
const formatResponse = ({ key, value }) => {
  return `\n${key}: ${value}`;
};
/**
 * TODO: насыщать эти данные из _pages/tutorial.md
 *
 * @returns {object}
 */
const getHelpData = () => {
  const helpData = {
    '/download': 'Загрузка файла с данными `/download`',
    '/dbclear': 'Удаление БД `/dbclear YES`',
    '/graph': 'Построение графиков `/graph String|RegExp`',
    '/get': 'Получение данных за этот срок `/get YYYY-MM-DD`',
    '/set': 'Добавление данных за этот срок `/set YYYY-MM-DD something`',
    '/count': 'Подсчет потраченого `/count -` и полученного `/count +`',
    '/kpp': 'Просмотр информации по своему чеку',
    '/search': 'Поиск вхождения `/search something`',
    '/balance': 'Отображение всех денежных средств пользователя',
    '/version':
      'Получение версии `/version` (для взаимодействия ботов нужна одинаковая версия)',
  };
  return helpData;
};
/**
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @returns {undefined}
 */
const onHelp = async ({ chat }) => {
  const helpData = getHelpData();
  const message = Object.keys(helpData).reduce((acc, key) => {
    acc += formatResponse({ key: key, value: helpData[key] });
    return acc;
  }, '');
  const chatId = chat.id;
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
  });
};

module.exports = onHelp;
