const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const annotationTemplate = require('../../../app/public/views/annotations');
/**
 * @returns {Promise<any>}
 */
module.exports = async function ({ name }) {
  try {
    const things = await pool.connect(async (connection) => {
      const result = await connection.many(storyQueries.selectThing(name));
      return result;
    });
    return Promise.resolve(annotationTemplate(things));
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
