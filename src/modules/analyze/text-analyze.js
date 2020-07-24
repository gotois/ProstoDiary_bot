const validator = require('validator');
const logger = require('../../lib/log');
const languageService = require('../../services/nlp.service'); // в моделях не должно быть сервисов
const DynamicAction = require('../../core/models/action/dynamic-action');
const WebContent = require('../../core/models/thing/web-content');

/**
 * @param {string} text - sentence text
 * @param {string} namespace - namespace
 * @param {any} creator - creator
 * @param {any} publisher - publisher
 * @returns {any}
 */
const detectBySentense = async (text, namespace, creator, publisher) => {
  logger.info('detectBySentense');
  const action = await DynamicAction({ text });

  // todo поддержать массивы экшенов в зависимости от понятых глаголов
  const actions = [action];

  const { tokens } = await languageService.analyzeSyntax(text);
  for (const token of tokens) {
    const { lemma } = token;

    if (validator.isEmail(lemma)) {
      // todo насыщать AbstractEmail
    } else if (validator.isMobilePhone(lemma)) {
      // todo насыщать AbstractPhone
    } else if (validator.isURL(lemma)) {
      const webcontentThing = await WebContent({
        url: lemma,
        namespace: namespace, // hack - передача namespace от родителя к потомку
        creator: creator.clientId, // hack - передача creator от родителя к потомку
        publisher: publisher, // hack - передача publisher от родителя к потомку
      });
      action.object.push(webcontentThing);
      action.name = webcontentThing.name;
    }
    // TODO: names получить имена людей
    //  ...
    // TODO: получить адреса из текста
    //  ...
    // TODO: получить даты
    //  ...
    // TODO: behavior; анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
    //  ...

    switch (token.partOfSpeech.tag) {
      case 'NOUN': {
        // существительное обычно отвечает на формирование name
        // todo если нет существительного что будет являться name?
        if (!action.name) {
          action.name = lemma;
        }
        break;
      }
      case 'VERB': {
        // todo глагол обычно отвечает на формирование Action
        // "поел и поработал" - формиует два: EatAction, WorkAction
        break;
      }
      default: {
        break;
      }
    }
  }

  return actions;
};

module.exports = async (abstract) => {
  // const { entities, language } = await languageService.analyzeEntities(this.text);
  // todo получение информации по локации
  // for (let entity of entities) {
  //   if (entity.type === 'LOCATION') {
  //     this.abstracts.push(new AbstractGeo({
  //       near: entity.name,
  //     }));
  //   }
  // }

  for (const hashtag of abstract.hashtags) {
    abstract.object.push({
      '@type': 'Thing',
      'name': hashtag,
    });
  }

  for (const sentense of languageService.splitTextBySentences(abstract.text)) {
    for (const subject of await detectBySentense(
      sentense,
      abstract.namespace,
      abstract.creator,
      abstract.publisher,
    )) {
      abstract.object.push(subject);
    }
  }
  abstract.abstract = abstract.text.toString('base64');

  // todo шифрование абстракта через openPGP (пока шифрование ботом излишне)
  // const crypt = require('../../services/crypt.service');
  // const encrypted = await crypt.openpgpEncrypt(Buffer.from(abstract.text), [
  //   passport.secret_key,
  // ]);
  // abstract.abstract = encrypted.data.toString('base64')
};
