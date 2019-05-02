module.exports = async (t) => {
  t.timeout(3000);
  const {
    get,
    // post, // TODO
  } = require('../../src/services/request.service');
  const siteBuffer = await get('https://prosto-diary.gotointeractive.com/');
  const html = siteBuffer.toString('utf8');
  t.is(html.slice(0, 15).toLowerCase(), '<!doctype html>');
};
