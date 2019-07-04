const Eyo = require('eyo-kernel');
const nlp = require('compromise');
const { inputAnalyze } = require('./intent.service');
const languageService = require('./language.service');
const { detectLang } = require('./detect-language.service');
const { spellText } = require('./speller.service');
const logger = require('./logger.service');

const getPeopleNames = async () => {
  // FIXME: пока работает только с английскими именами
  const peopleNames = nlpDocument.people().data();
};

const getBehavior = async () => {
  try {
    const syntaxResult = await languageService.analyzeSyntax(text);
    language.googleCode = syntaxResult.language;
    console.log(syntaxResult)
    // syntax.tokens.forEach(part => {
    //   console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    //   console.log(`Morphology:`, part.partOfSpeech);
    // });
  } catch (error) {
    logger.error(error);
  }
};

const textTokens = () => {
  const nlpDocument = nlp(text);
  // Токенизация слов
  const document = nlpDocument.normalize().out('text');
  logger.info(document);
  
  return [];
}

const getIntent = async () => {
  // const intentAbstract = new IntentAbstract(dialogflowIntent);
  
  // Находим интенты
  // TODO: refactoring inputAnalyze. KISS
  const intentMessage = await inputAnalyze(spelledTextFact);
  logger.info(intentMessage);
  
  if (intentMessage.length === 0) {
    // генерация undefined Intent
  } else {
    // TODO: на основе Intent'a делаем различные предположения и записываем в БД в структурированном виде
  }
  
  return '';
}

// const { Abstract } = require('./abstract.service');
/**
 * ВАЖНО! Это не StoryLanguage!
 * Создание единой (общей) истории деятельности абстрактов
 * ответом служит полученные Факты из текста
 * @description Story управляется абстрактами. Которые насыщаются в abstract.service
 */
class Story {
  #text;
  #language = []; // @example ['ru', rus', 'russian']
  #emotion = []; // @example ['normal', 'angry']
  #spelledText;
  #hrefs = []; // internet links
  #names = []; // полученные имена людей
  #addresses = []; // полученные адреса из текста
  #emails = []; // полученные данные о почте
  #phones = []; // полученные телефоны
  #behavior; // анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
  #intent; // Определяем намерения
  #geo; // место где произошло событие
  #date; // Получение даты события (Подведение таймлайна) <SmartDate>?
  #object; // Получение существа события - сущность события
  
  constructor (text = '') {
    this.#text = text;
    this.#language.push(detectLang(text).language);
  }
  
  // Здесь происходит наполнение Абстрактов из полученного текста
  // Это насыщение абстракных моделей полученных внутри бота
  // Абстракт имеет в себе факты, включая ссылки на них и краткую мета
  // https://github.com/gotois/ProstoDiary_bot/issues/84
  async fill () {
    console.log('input text', this.#text);
    
    // ёфикация текста
    const safeEyo = new Eyo();
    safeEyo.dictionary.loadSafeSync();
    this.#spelledText = safeEyo.restore(this.#text);
    
    console.log('language', this.#language[0]);
    try {
      this.#spelledText = await spellText(this.#spelledText/*, this.#language[0]*/);
    } catch (error) {
      logger.error(error);
    }
    
    
    // todo: заполнение
    // Насыщение абстрактов (от Abstract к Natural)
    // ...
    // FIXME: Разбить текст на строки через "\n" (Обработка каждой строки выполняется отдельно)
    // А еще лучше если это будет сделано через NLP
    // ...
    // const abstract = new Abstract(text);
    // const abstractDefinitions = await abstract.process();
  
    console.log('spelledText: ', this.#spelledText);
  }
  /**
   *
   * @description Operation Definition (Типизация абстрактов в строгий структурный вид)
   */
  async definition () {
    // Связка абстракта фактами
    // ...
    // Сериализация найденных параметров (Entities)
    // ...
  
    // Исправление кастомных типов
    // ...
  
    // Merge - формируем Конечный состав параметров
    // включающий undefined если нигде не получилось ничего найти
    // ...
    
    // const link = await Story.find(this.abstractDefinitions);
  
    return {
      // link, // историческая ссылка
      // projects: [], // Разбиение на проекты (нужно для лучшего поиска) // https://github.com/gotois/ProstoDiary_bot/issues/79
      // это мета данные для StoryLanguage
      meta: {
        resultText: this.#spelledText,
      },
    };
  }
  
  // Поиск исторической ссылки  (Хэш?)
  static async find (abstractDefinitions) {
    return '';
  }
  
  /**
   * Обновление/Дополнение в БД
   * @returns {Promise<void>}
   */
  async update () {
  }
  
  /**
   * сохранение в БД
   * @returns {Promise<void>}
   */
  async save () {
  }
}

module.exports = Story;
