/**
 * ВАЖНО! Это не StoryLanguage!
 * Создание единой (общей) истории деятельности абстрактов
 * ответом служит полученные Факты из текста
 * @description Story управляется абстрактами. Которые насыщаются в abstract.service
 */
class Story {
  #name;
  #abstracts = [];
  #interval = []; // SmartDate
  /**
   * @param {Abstract} abstract - original
   */
  constructor(abstract, name = 'Health') {
    this.#abstracts.push(abstract);
    this.#name = name;
    // todo: получаем из абстрактов данные о времени и авторах
  }
  /**
   * @description Operation Definition (Типизация абстрактов в строгий структурный вид) - формируем Конечный состав параметров, включающий undefined если нигде не получилось ничего найти
   * Единый ответ для записи истории как для бота, так и для пользователя
   *
   * @returns {object}
   */
  toJSON () {
    return {
      name: this.#name, //
      // abstract_ids: [], // todo
      interval: this.#interval,
      // author_ids: JSON.stringify(PERSON), // todo: change person type
    };
  }
}

module.exports = Story;
