const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const googleKnowledgeGraph = require('../../../lib/google-knowledge-graph');

module.exports = async (request, response) => {
  try {
    const { name } = request.params;
    // todo Поддержать редирект (307) вида: /thing/.../яблок => /thing/.../яблоко
    // ...
    const things = await pool.connect(async (connection) => {
      const result = await connection.many(storyQueries.selectThing(name));
      return result;
    });
    let gkgData;
    if (things.length > 0) {
      gkgData = await googleKnowledgeGraph.query(name);
    }
    response.status(200).json({
      '@context': 'http://schema.org/',
      '@type': 'ItemList',
      // насыщаем открытыми данными
      'description': gkgData && gkgData.itemListElement[0].result.description,
      'url': gkgData && gkgData.itemListElement[0].result.url,
      'image': gkgData && gkgData.itemListElement[0].result.image,
      // description - краткое описание через GOOGLE_KNOWLEDGE_GRAPH
      'itemListElement': things.map((thing, index) => {
        return {
          '@type': 'ListItem',
          'position': index + 1,
          'item': thing.context,
        };
      }),
    });
  } catch (error) {
    response.status(400).json({
      error: error.message,
    });
  }
};
