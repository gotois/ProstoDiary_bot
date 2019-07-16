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
 * @todo поддержать еще варианта /help something, где будет происходить поиск по something
 * @returns {string}
 */
module.exports = () => {
  const helpData = getHelpData();
  const message = Object.keys(helpData).reduce((acc, key) => {
    acc += formatResponse({ key: key, value: helpData[key] });
    return acc;
  }, '');
  return message;
};
