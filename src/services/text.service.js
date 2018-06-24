/**
 * @example .5 -> 0.5
 * @param match {string}
 * @param matchIndex {Number}
 * @param text {string}
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
 * @param query {string}
 * @returns {string}
 */
const formatQuery = (query) => {
  let temp;
  if (Array.isArray(query)) {
    temp = query[0];
  } else {
    temp = query;
  }
  temp = temp.trim();
  temp = temp.replace(/\.\d+/gm, dotNumberReplacer);
  
  return temp;
};
/**
 * @param str {string}
 * @param start {Number}
 * @param end {Number}
 * @param what {string}
 * @returns {string}
 */
const replaceBetween = (str, start, end, what) => {
  return str.substring(0, start) + what + str.substring(end);
};

module.exports = {
  formatQuery,
  replaceBetween,
};
