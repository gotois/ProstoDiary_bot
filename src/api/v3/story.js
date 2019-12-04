const Story = require('../../models/story');
/**
 * fixme это не должно быть в API. это закрытый интерфейс доступный через mail processing (в котором происходит для логика валидации отправщика)
 *
 * @description Чтение письма и запись в БД - Полный разбор и получение из всего этого storyJSON
 * @param {object} parameters - jsonrpc parameters
 * @param {?object} basic - basic auth
 * @returns {Promise<string>}
 */
module.exports = async (parameters, basic) => {
  const { subject, body, uid, contentType } = parameters;
  const story = new Story({
    subject,
    body,
    contentType,
    uid,
  });
  const { id } = await story.commit();
  console.log('result: ', story.toJSON());
  return 'Сообщение бота успешно сохранено ' + id;
};
