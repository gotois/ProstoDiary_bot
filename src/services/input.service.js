/**
 *
 * @param input {String}
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
 * @param input {String}
 * @returns {RegExp}
 */
const createRegExp = input => {
  const fWord = formatWord(input);
  return new RegExp(`( ${fWord} )|(\n${fWord})|(${fWord}\n)|(\n${fWord}\n)|( ${fWord}$)|(^${fWord} )|(^${fWord}$)`, 'i');
};
/**
 *
 * @param input {String}
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
 * @param input {String}
 * @returns {RegExp}
 */
const convertStringToRegexp = input => new RegExp(input.slice(1, input.length - 1));
/**
 *
 * @param input {String}
 * @returns {RegExp}
 */
const createRegexInput = input => (
  isRegexString(input) ? convertStringToRegexp(input) : createRegExp(input)
);
/**
 *
 * @param regexString {String}
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
