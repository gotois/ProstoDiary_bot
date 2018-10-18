/**
 * @param {string} query - query
 * @returns {Object}
 */
const getParams = query => {
  if (!query) {
    return {};
  }
  
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
};

module.exports = {
  getParams,
};
