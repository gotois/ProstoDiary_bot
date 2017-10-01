/**
 *
 * @param input {String}
 * @returns {String}
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
 * @return {RegExp}
 */
const createRegExp = input => {
  const fWord = formatWord(input);
  return new RegExp(`( ${fWord} )|(\n${fWord})|(${fWord}\n)|(\n${fWord}\n)|( ${fWord}$)|(^${fWord} )|(^${fWord}$)`, 'i');
};
/**
 *
 * @param input {String}
 * @return {boolean}
 */
const isRegexString = input => {
  if (input[0] === '/' && input[input.length - 1] === '/') {
    return true;
  }
  return false;
};
/**
 *
 * @param input {String}
 * @return {RegExp}
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

module.exports = {
  formatWord,
  createRegExp,
  isRegexString,
  convertStringToRegexp,
  createRegexInput,
};
