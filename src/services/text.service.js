const Eyo = require('eyo-kernel');
const dialogService = require('./dialog.service');
const { detectLang, isRUS, isENG } = require('./nlp.service');
const logger = require('./logger.service');
const { post } = require('./request.service');
const crypt = require('./crypt.service');
const { FakerText } = require('./faker.service');
/**
 * @param {string} string - string
 * @param {number} start - start
 * @param {number} end - end
 * @param {string} what - what text
 * @returns {string}
 */
const replaceBetween = (string, start, end, what) => {
  return string.slice(0, start) + what + string.slice(end);
};
/**
 * @constant
 * @type {string}
 */
const SPELLER_HOST = 'speller.yandex.net';
/**
 * @param {object} obj - object
 * @param {string} obj.text - Текст для проверки
 * @param {string} obj.lang - Языки проверки
 * @param {string} obj.format - Формат проверяемого текста
 * @param {number} obj.options - Опции Яндекс.Спеллера. Значением параметра является сумма значений требуемых опций
 * @returns {Promise<Array|ReferenceError>}
 */
const spellCheck = async ({
  text,
  lang = 'ru,en',
  options = 0,
  format = 'plain',
}) => {
  const result = await post(
    `https://${SPELLER_HOST}/services/spellservice.json/checkText`,
    {
      format,
      lang,
      text,
      options,
    },
  );
  if (!Array.isArray(result)) {
    throw new ReferenceError('spellCheck API changes');
  }
  return result;
};
/**
 * Исправляем очевидные ошибки
 *
 * await spellText('рублкй') -> рублей
 * Важно! Данные берутся относительно текущего месторасположения, включая VPN
 *
 * @param {string} text - user text
 * @param {string} [lang] - text language
 * @returns {Promise<string>}
 */
const spellText = async (text, lang) => {
  if (!text) {
    throw new Error('Text is undefined');
  }
  let out = text;
  const array = await spellCheck({
    text,
    lang,
  });

  for (const a of array) {
    const [replacedWord] = a.s;
    out = replaceBetween(out, a.pos, a.pos + a.len, replacedWord);
  }

  return out;
};
/**
 *
 * @param {string} input - text
 * @returns {RegExp}
 */
const createRegexInput = (input) => {
  return isRegexString(input)
    ? convertStringToRegexp(input)
    : createRegExp(input);
};
/**
 *
 * @param {string} input - text
 * @returns {boolean}
 */
const isRegexString = (input) => {
  if (input.length <= 2) {
    return false;
  }
  if (input.startsWith('/')) {
    if (input.endsWith('/')) {
      return true;
    }
    const backslashes = input.split('/');
    if (backslashes.length < 3) {
      return false;
    }
    const endBackslashe = backslashes[backslashes.length - 1];
    if (
      endBackslashe.includes('m') ||
      endBackslashe.includes('i') ||
      endBackslashe.includes('g')
    ) {
      return true;
    }
  }
  return false;
};
/**
 *
 * @param {string} input - text
 * @returns {RegExp}
 */
const createRegExp = (input) => {
  const fWord = formatWord(input);
  return new RegExp(
    `( ${fWord} )|(\n${fWord})|(${fWord}\n)|(\n${fWord}\n)|( ${fWord}$)|(^${fWord} )|(^${fWord}$)`,
    'i',
  );
};
/**
 *
 * @param {string} input - text
 * @returns {string}
 */
const formatWord = (input) => {
  switch (input.toLowerCase()) {
    case '\\d':
    case '\\s':
    case '\\b':
    case '\\w':
    case '[':
    case '/':
    case '.':
    case '^':
    case '$':
    case '|':
    case '?':
    case '*':
    case '+':
    case '(':
    case ')':
      return `\\${input}`;
    default: {
      return input;
    }
  }
};

/**
 *
 * @param {string} input - text
 * @returns {RegExp}
 */
const convertStringToRegexp = (input) => {
  // eslint-disable-next-line unicorn/prefer-negative-index
  return new RegExp(input.slice(1, input.length - 1));
};

/**
 * Message updated text
 *
 * @param {string} input - user input text
 * @returns {string}
 */
const formatterText = (input) => {
  return `${input.replace(/\n/g, ' ').slice(0, 6)}…`;
};
/**
 * @param {Array} rows - array rows
 * @returns {Array}
 */
const decodeRows = (rows = []) => {
  return rows.map(({ date, text }) => {
    return {
      date,
      text: crypt.decode(text),
    };
  });
};
const correctionText = async (text) => {
  const language = detectLang(text).language;
  // ёфикация текста
  if (isRUS(language)) {
    const safeEyo = new Eyo();
    safeEyo.dictionary.loadSafeSync();
    text = safeEyo.restore(text);
  } else if (isENG(language)) {
    // english rules ...
  } else {
    // пока только поддерживаем EN, RU
    logger.warn('Unsupported language');
  }
  try {
    const yandexSpellLanguageCode = language.slice(0, 2);
    text = await spellText(text, yandexSpellLanguageCode);
  } catch (error) {
    logger.error(error);
  }

  // Исправление кастомных типов
  // (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
  // 	.9 -> 0.9
  // ...
  return text;
};
/**
 * @param {object} requestObject - requestObject
 * @returns {Promise<object>}
 */
const prepareText = async (requestObject) => {
  const { text, secretKey, caption } = requestObject;
  const categories = [];
  if (caption) {
    categories.push(caption.toLowerCase());
  }
  let subject;
  // Автоматическое исправление опечаток
  const correction = await correctionText(text);
  const fakeText = FakerText.text(text);
  if (fakeText.length <= 256) {
    try {
      const dialogflowResult = await dialogService.detect(fakeText);
      // todo выбирать только те параметры в которых есть вхождения
      categories.push(...Object.keys(dialogflowResult.parameters.fields));
      subject = dialogflowResult.intent.displayName;
    } catch (error) {
      logger.error(error.message);
    }
  }
  const buffer = Buffer.from(correction);
  // todo Автоисправление кастомных типов
  //  найденных параметров (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
  // ...
  const encrypted = await crypt.openpgpEncrypt(buffer, [secretKey]);
  return {
    mime: 'plain/text',
    subject: subject || 'Save to Diary',
    content: encrypted.data,
    original: text,
    categories,
  };
};

module.exports = {
  spellText,
  createRegexInput,
  formatWord,
  isRegexString,
  previousInput: formatterText,
  decodeRows,
  correctionText,
  replaceBetween,
  prepareText,
};
