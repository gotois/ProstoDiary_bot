const validator = require('validator');
const Content = require('./index');
const AbstractText = require('../abstract/abstract-text');
const AbstractGeo = require('../abstract/abstract-geo');
const languageService = require('../../services/nlp.service');
const logger = require('../../services/logger.service');
/**
 * plain text
 */
class ContentText extends Content {
  #text;
  constructor(data) {
    super(data);
    this.#text = data.content;
  }

  /**
   * Разбор сообщения на типы (даты, имена, города, и т.д.)
   * поиск тела письма -> натурализация и сведение фактов в Истории -> оптимизация БД
   * @returns {Promise<object>}
   */
  async prepare() {
    logger.info('content-text prepare');

    const { entities, language } = await languageService.analyzeEntities(this.#text);
    const { tokens } = await languageService.analyzeSyntax(this.#text);

    this.abstracts.push(new AbstractText({
      language,
      text: this.#text,
    }));
    for (let { lemma } of tokens) {
      if (validator.isEmail(lemma)) {
        // this.abstracts.push(new AbstractEmail(lemma));
      } else if (validator.isMobilePhone(lemma)) {
        // this.abstracts.push(new AbstractPhone(lemma));
      } else if (validator.isURL(lemma)) {
        // this.abstracts.push(new AbstractLinks(lemma));
      }
      // TODO: names получить имена людей
      //  ...
      // TODO: получить адреса из текста
      //  ...
      // TODO: получить даты
      //  ...
      // TODO: behavior; анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
      //  ...
    }
    // console.log(entities, sentences, tokens)

    for (let entity of entities) {
      if (entity.type === 'LOCATION') {
        this.abstracts.push(new AbstractGeo({
          near: entity.name,
        }));
      }
    }
  }
}

module.exports = ContentText;
