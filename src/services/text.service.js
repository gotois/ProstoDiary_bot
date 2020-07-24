const Eyo = require('eyo-kernel');
const speller = require('../lib/speller');
// const dialogService = require('./dialog.service');
const { detectLang, isRUS, isENG } = require('./nlp.service');
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
 * @description Исправляем очевидные ошибки. Важно! Данные берутся относительно текущего месторасположения, включая VPN
 * @example // рублей
 * spellText('рублкй');
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
  const array = await speller({
    text,
    lang,
  });

  for (const { s, len, pos } of array) {
    const [replacedWord] = s;
    out = replaceBetween(out, pos, pos + len, replacedWord);
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
 * @description Message updated text
 * @param {string} input - user input text
 * @returns {string}
 */
const previousInput = (input) => {
  return `${input.replace(/\n/g, ' ').slice(0, 6)}…`;
};
/**
 * @todo перенести в core
 * @description Автоматическое исправление опечаток
 * @param {string} text - text
 * @returns {Promise<string>}
 */
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
    throw new Error('Unsupported language');
  }
  try {
    const yandexSpellLanguageCode = language.slice(0, 2);
    text = await spellText(text, yandexSpellLanguageCode);
  } catch /* (error) */ {
    // logger.error(error);
  }

  // Исправление кастомных типов
  // (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
  // 	.9 -> 0.9
  // ...
  return text;
};

module.exports = {
  spellText,
  createRegexInput,
  formatWord,
  isRegexString,
  previousInput,
  correctionText,
  replaceBetween,
};
