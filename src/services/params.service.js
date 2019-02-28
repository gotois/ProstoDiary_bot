/**
 * @param {string} query - query
 * t - время нужно преобразовать
 * s - сумма
 * @returns {{t: string, fn: string, i: string, fp: string, n: string}}
 */
const getParams = (query) => {
  if (!query) {
    return {}; //fixme: throw new Error
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
