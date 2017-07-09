/**
 *
 * @param word {String}
 * @returns {String}
 */
function formatWord(word) {
  switch (word.toLowerCase()) {
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
      return `\\${word}`;
    default: {
      return word;
    }
  }
}
/**
 *
 * @param word {String}
 * @return {RegExp}
 */
function createRegExp(word) {
  const fWord = formatWord(word);
  return new RegExp(`( ${fWord} )|(\n${fWord})|(${fWord}\n)|(\n${fWord}\n)|( ${fWord}$)|(^${fWord} )|(^${fWord}$)`, 'i');
}
/**
 *
 * @param string {String}
 * @return {boolean}
 */
function isRegexString(string) {
  if (string[0] === '/' && string[string.length - 1] === '/') {
    return true;
  }
  return false;
}
/**
 *
 * @param string {String}
 * @return {RegExp}
 */
function convertStringToRegexp(string) {
  return new RegExp(string.slice(1, string.length - 1));
}
/**
 *
 * @param input {String}
 * @returns {RegExp}
 */
function createRegexInput(input) {
  return (isRegexString(input) ? convertStringToRegexp(input) : createRegExp(input));
}

module.exports = {
  formatWord,
  createRegExp,
  isRegexString,
  convertStringToRegexp,
  createRegexInput,
};
