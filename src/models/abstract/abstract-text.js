const validator = require('validator');
const Abstract = require('./abstract');
const AbstractGeo = require('./abstract-geo');
const AbstractWeather = require('./abstract-weather');
const languageService = require('../../services/nlp.service');

class AbstractText extends Abstract {
  #text;
  /**
   * @example ['ru', rus', 'russian']
   * @type {Array}
   */
  #language = [];

  constructor(text) {
    super();
    this.#text = text;
  }

  get context() {
    return {
      ...super.context,
      // weather: this.weather,
      // location: this.location,
      // language - ISO

      // emails
      // phones
      // hrefs
      // formattedAddress
      // tokens
    };
  }

  set language(langCode) {
    if (!this.#language.includes(langCode)) {
      this.#language.unshift(langCode);
    }
  }
  /**
   * @todo результат в виде JSON-LD
   * поиск тела письма -> натурализация и сведение фактов в Истории -> оптимизация БД
   * @returns {Promise<object>}
   */
  async commit() {
    const emails = []; // полученные данные о почте
    const phones = []; // полученные телефоны
    const hrefs = []; // internet links
    const locations = [];
    const weathers = [];

    // todo Разбор сообщения на типы (даты, имена, города, и т.д.)
    //  ...
    const { categories, documentSentiment, entities, language, sentences, tokens } = await languageService.annotateText(this.#text);
    this.language = language;
    for (let { lemma } of tokens) {
      if (validator.isEmail(lemma)) {
        emails.push(lemma);
      } else if (validator.isMobilePhone(lemma)) {
        phones.push(lemma);
      } else if (validator.isURL(lemma)) {
        hrefs.push(lemma);
      }
      // TODO: names получить имена людей
      //  ...
      // TODO: получить адреса из текста
      //  ...
      // TODO: получить даты
      //  ...
      // TODO: получить geoJSON из текста
      //  ...
      // TODO: behavior; анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
      //  ...
    }
    // console.log(entities, sentences, tokens)

    for (let entity of entities) {
      // насыщаем foursquare
      if (entity.type === 'LOCATION') {
        const abstractGeo = new AbstractGeo({
          near: entity.name,
        });
        const location = await abstractGeo.commit();
        locations.push(location);
        const abstractWeather = new AbstractWeather(
          {
            latitude: location.geo.geometry.coordinates[0],
            longitude: location.geo.geometry.coordinates[1]
          });
        const weather = await abstractWeather.commit();
        weathers.push(weather);
      }
    }

    console.log('location', locations)
    console.log('weathers', weathers)

    return this.context;
  }
}

module.exports = AbstractText;
