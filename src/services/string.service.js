/**
 * .5 -> 0.5
 *
 * @param {string} match - match
 * @param {number} matchIndex - index
 * @param {string} text - text
 * @returns {string}
 */
const dotNumberReplacer = (match, matchIndex, text) => {
  if (matchIndex === 0) {
    match = '0' + match;
  } else if ([' '].includes(text[matchIndex - 1])) {
    match = '0' + match;
  }
  return match;
};
/**
 * @param {string} query - query
 * @returns {string}
 */
const formatQuery = (query) => {
  return query.trim().replace(/\.\d+/gm, dotNumberReplacer);
};
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

module.exports = {
  formatQuery,
  replaceBetween,
  createRegexInput,
  formatWord,
  isRegexString,
};
