const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');
const templateList = require('../../../app/views/message/message-list');

module.exports = async function ({ from, to, bot, user }) {
  try {
    const { storyTable } = await pool.connect(async (connection) => {
      const roleTable = await connection.one(
        passportQueries.selectRoleByEmail(user),
      );
      const { role } = roleTable;
      if (!role) {
        throw new Error('forbidden');
      }
      const storyTable = await connection.many(
        storyQueries.selectCreatorStoryByDate({
          creator: bot,
          from,
          to,
        }),
      );
      return {
        storyTable,
        role,
      };
    });
    return Promise.resolve(templateList(storyTable));
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
