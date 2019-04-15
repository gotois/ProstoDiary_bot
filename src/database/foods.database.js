const { $$ } = require('./index');
const { getPostgresLangCode } = require('../services/detect-language.service');
/**
 *
 * @param {string} title - food title
 * @returns {Promise<Array>}
 */
const _get = async (title) => {
  const lang = getPostgresLangCode(title);
  const res = await $$(
    `SELECT id, title, protein, fat, carbohydrate, kcal FROM Foods
     WHERE to_tsvector($2, title) @@ plainto_tsquery($2, $1);`,
    [title, lang],
  );
  return res.rows;
};
module.exports = {
  get: _get,
};
