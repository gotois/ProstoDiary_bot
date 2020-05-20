const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');

module.exports = async function ({ uuid, user }) {
  try {
    if (!uuid) {
      throw new Error('unknown uuid');
    }
    const { storyTable } = await pool.connect(async (connection) => {
      const { role } = await connection.maybeOne(
        passportQueries.selectRoleByEmail(user),
      );
      if (!role) {
        throw new Error('forbidden');
      }
      const storyTable = await connection.one(
        storyQueries.selectStoryById(uuid),
      );
      return {
        storyTable,
      };
    });
    return Promise.resolve({
      contentType: storyTable.content_type,
      content: storyTable.content,
    });
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
