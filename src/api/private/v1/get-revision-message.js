 const redis = require('../../../lib/redis');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');
const templateMessage = require('../../../app/public/views/message/message');
const { filter } = require('../../../services/rbac.service');

// todo поддержать ревизии сообщения
module.exports = async function ({ uuid, user }) {
  try {
    if (!uuid) {
      throw new Error('unknown uuid');
    }
    const { role, storyTable, isOwner } = await pool.connect(
      async (connection) => {
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
          role,
          storyTable,
          isOwner: false, // todo использовать данные из storyTable.creator и связывать с хозяином бота
        };
      },
    );

    const key = 'message:' + role + uuid;
    const prime = await redis.get(key);
    if (prime && prime.value) {
      return Promise.resolve(JSON.parse(prime.value));
    }
    const temporary = await templateMessage(storyTable, role);
    const values = filter(temporary, isOwner, role);
    await redis.set(key, JSON.stringify(values), { expires: 500 });
    return Promise.resolve(values);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
