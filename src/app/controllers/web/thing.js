// const { sql, pool } = require('../../../db/sql');

module.exports = (request, response) => {
  try {
    const { name } = request.params;
    // fixme насыщать вещь данными по идентификатору name и пользовательской истории
    // ...
    response.status(200).send({
      '@context': 'http://schema.org/',
      '@type': 'Thing',
      'name': name,
      // alternateName -- todo исправленный вариант слова через spellText
      // description - краткое описание через GOOGLE_KNOWLEDGE_GRAPH
      // sameAs -- похожее если находится в БД

      // todo нужна агрегация по таймлайну входящих message URL
    });
  } catch (error) {
    response.status(400).json({
      error: error.message,
    });
  }
};
