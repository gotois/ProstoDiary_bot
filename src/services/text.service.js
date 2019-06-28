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
 * @param {string} str - string
 * @param {number} start - start
 * @param {number} end - end
 * @param {string} what - what text
 * @returns {string}
 */
const replaceBetween = (string, start, end, what) => {
  return string.substring(0, start) + what + string.substring(end);
};

module.exports = {
  formatQuery,
  replaceBetween,
};
