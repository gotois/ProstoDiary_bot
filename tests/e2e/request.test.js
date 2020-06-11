module.exports = async (t) => {
  t.timeout(3000);
  const { get } = require('../../src/lib/request');
  const siteBuffer = await get('https://prosto-diary.gotointeractive.com/');
  const html = siteBuffer.toString('utf8');
  t.is(html.slice(0, 15).toLowerCase(), '<!doctype html>');
};
