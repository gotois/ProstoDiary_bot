const { $$ } = require('.');
const { detectLang } = require('../services/detect-language.service');
/**
 *
 * @param {string} title - food title
 * @returns {Promise<Array>}
 */
const _get = async (title) => {
  const lang = detectLang(title).postgresql;
  const result = await $$(
    `SELECT id, title, protein, fat, carbohydrate, kcal FROM Foods
     WHERE to_tsvector($2, title) @@ plainto_tsquery($2, $1);`,
    [title, lang],
  );
  return result.rows;
};
module.exports = {
  get: _get,
};
