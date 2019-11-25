/**
 * @description блокировки чтения/приема и общей работы бота
 * @param {object} requestObject - requestObject
 * @returns {Promise<void>}
 */
module.exports = async (requestObject) => {
  const { telegram = -1, email = '', token } = requestObject;
  // todo изменять флаг activated
  //  ...
  // todo: деактивировать почтовый ящик
  //  https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
  return 'Бот деактивирован';
};
