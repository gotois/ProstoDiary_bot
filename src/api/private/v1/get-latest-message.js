const redis = require('../../../lib/redis');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');
const templateList = require('../../../app/public/views/message/message-list');
const { filter } = require('../../../services/rbac.service');

module.exports = async function ({ limit = '10', user }) {
  try {
    const { storyTable, role, isOwner } = await pool.connect(
      async (connection) => {
        const { role } = await connection.maybeOne(
          passportQueries.selectRoleByEmail(user),
        );
        if (!role) {
          throw new Error('forbidden');
        }
        const storyTable = await connection.many(
          storyQueries.selectLatestStories(limit),
        );
        return {
          storyTable,
          role,
          isOwner: false, // todo isOwner: false is hack
        };
      },
    );
    const key = 'latest:' + role + user + limit;
    const prime = await redis.get(key);
    if (prime && prime.value) {
      return Promise.resolve(JSON.parse(prime.value));
    }
    const temporary = templateList(storyTable);
    const values = filter(temporary, isOwner, role);
    await redis.set(key, JSON.stringify(values), { expires: 500 });
    return Promise.resolve(values);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
