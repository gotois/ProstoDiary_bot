const cheerio = require('cheerio');
const { get } = require('../services/request.service');
/**
 * @param {string} url - page url
 * @returns {Promise<object>}
 */
module.exports = async function (url) {
  const html = await get(url);
  const $ = cheerio.load(html);

  let title = '';
  let name = '';
  $('meta[property="og:title"]').each((i, item) => {
    title = item.attribs.content;
  });
  $('meta[property="og:site_name"]').each((i, item) => {
    name = item.attribs.content;
  });

  return {
    title,
    name,
    encodingFormat: 'text/html', // todo брать кодировку от ответа url
  };
};
