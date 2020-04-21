const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const googleKnowledgeGraph = require('../../../lib/google-knowledge-graph');

module.exports = async (request, response) => {
  try {
    const { name } = request.params;
    let description = null;
    let url = null;
    let image = null;
    // todo Поддержать редирект (307) вида: /thing/.../яблок => /thing/.../яблоко
    // ...
    const things = await pool.connect(async (connection) => {
      const result = await connection.many(storyQueries.selectThing(name));
      return result;
    });
    if (things.length > 0) {
      // насыщаем открытыми данными
      const gkgData = await googleKnowledgeGraph.query(name);
      if (gkgData.itemListElement.length > 0) {
        description = gkgData.itemListElement[0].result.description;
        url = gkgData.itemListElement[0].result.url;
        image = gkgData.itemListElement[0].result.image;
      }
    }
    response
      .contentType('application/ld+json')
      .status(200)
      .json({
        '@context': 'http://schema.org/',
        '@type': 'ItemList',
        'description': description,
        'url': url,
        'image': image,
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
