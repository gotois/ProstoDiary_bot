const Story = require('../../models/story');
/**
 * @description Чтение письма и запись в БД - Полный разбор и получение из всего этого storyJSON
 * @param {object} parameters - jsonrpc parameters
 * @param {?object} basic - basic auth
 * @returns {Promise<string>}
 */
module.exports = async (parameters, basic) => {
  const { mail, secret_key } = parameters;
  const { from, headers } = mail;
  // Валидация письма
  if (headers['x-bot'] || from[0].address === 'xxx@ya.ru') {
    const story = new Story({
      mail,
      secret_key,
    });
    const { id } = await story.commit();
    console.log('result: ', story.toJSON());
    return 'Сообщение бота успешно сохранено ' + id;
  } else {
    // todo Иначе сразу удаляем
    //  ...
    return 'Сообщение пользователя успешно удалено и помечено в спам';
  }
};
