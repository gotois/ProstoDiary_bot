const cheerio = require('cheerio');
const { get } = require('../services/request.service');
/**
 * @param {string} url - page url
 * @returns {Promise<void>}
 */
module.exports = async function (url) {
  const html = await get(url);
  const $ = cheerio.load(html);

  let title = '';
  $('meta[property="og:title"]').each((i, item) => {
    title = item.attribs.content;
  });

  return {
    title,
  };
};
