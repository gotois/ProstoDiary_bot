/**
 *
 * @param {string} input - text
 * @returns {string}
 */
const formatWord = input => {
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
const createRegExp = input => {
  const fWord = formatWord(input);
  return new RegExp(`( ${fWord} )|(\n${fWord})|(${fWord}\n)|(\n${fWord}\n)|( ${fWord}$)|(^${fWord} )|(^${fWord}$)`, 'i');
};
/**
 *
 * @param {string} input - text
 * @returns {boolean}
 */
const isRegexString = input => {
  if (input.length <= 2) {
    return false;
  }
  if (input.startsWith('/')) {
    if ((input.endsWith('/'))) {
      return true;
    }
    const backslashes = input.split('/');
    if (backslashes.length < 3) {
      return false;
    }
    const endBackslashe = backslashes[backslashes.length - 1];
    if (endBackslashe.includes('m') || endBackslashe.includes('i') || endBackslashe.includes('g')) {
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
const convertStringToRegexp = input => new RegExp(input.slice(1, input.length - 1));
/**
 *
 * @param {string} input - text
 * @returns {RegExp}
 */
const createRegexInput = input => (
  isRegexString(input) ? convertStringToRegexp(input) : createRegExp(input)
);
/**
 *
 * @param {string} regexString - regexp
 * @returns {string}
 */
const normalizeRegexStringToString = regexString => {
  return regexString.replace(/^\//, '').replace(/\/$/, '');
};

module.exports = {
  formatWord,
  createRegExp,
  isRegexString,
  convertStringToRegexp,
  normalizeRegexStringToString,
  createRegexInput,
};
