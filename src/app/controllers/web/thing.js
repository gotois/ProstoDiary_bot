const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const { SERVER } = require('../../../environment');

// используется формат https://www.w3.org/TR/annotation-protocol/
module.exports = async (request, response) => {
  try {
    const { name } = request.params;
    // todo Поддержать редирект (307) вида: /thing/.../яблок => /thing/.../яблоко
    // ...
    const things = await pool.connect(async (connection) => {
      const result = await connection.many(storyQueries.selectThing(name));
      return result;
    });
    response
      .contentType('application/ld+json')
      .status(200)
      .send({
        '@context': [
          'http://www.w3.org/ns/anno.jsonld',
          'http://www.w3.org/ns/ldp.jsonld',
        ],
        'id': 'http://example.org/annotations/?iris=0',
        'type': ['BasicContainer', 'AnnotationCollection'],
        'total': things.length,
        'modified': '2016-07-20T12:00:00Z',
        'label': 'A Container for Web Annotations',
        'first': {
          id: 'http://example.org/annotations/?iris=0&page=0',
          type: 'AnnotationPage',
          next: 'http://example.org/annotations/?iris=0&page=1',
          items: things.map((thing, index) => {
            return {
              item: {
                id: 'http://example.org/annotations/anno' + index + 1,
                type: 'Annotation',
                body: `${SERVER.HOST}/message/${thing.publisher}/${thing.message_id}`,
                target: {
                  id: thing.context.url,
                  format: thing.encodingFormat,
                },
              },
            };
          }),
        },
        'last': 'http://example.org/annotations/?iris=0&page=840',
      });
  } catch (error) {
    response.status(400).json({
      error: error.message,
    });
  }
};
