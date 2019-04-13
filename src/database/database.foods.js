const { $$ } = require('./index');
const { getPostgresLangCode } = require('../services/detect-language.service');
/**
 *
 * @param {string} title - food title
 * @returns {Promise}
 */
const _get = (title) => {
  const lang = getPostgresLangCode(title);
  return $$(
    `SELECT id, title, protein, fat, carbohydrate, kcal FROM Foods
     WHERE to_tsvector($2, title) @@ plainto_tsquery($2, $1);`,
    [title, lang],
  );
};
module.exports = {
  get: _get,
};
