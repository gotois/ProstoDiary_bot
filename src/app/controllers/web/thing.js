const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const annotationTemplate = require('../../views/annotations');

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
      .send(annotationTemplate(things));
  } catch (error) {
    response.status(400).json({
      error: error.message,
    });
  }
};
