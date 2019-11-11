const { pool, sql, NotFoundError } = require('../database');

// await load(message.from.id);
const load = async (value) => {
  if (!Number.isInteger(value)) {
    throw new TypeError('Invalid load profile');
  }
  const profile = await pool.connect(async (connection) => {
    try {
      const res = await connection.maybeOne(
        sql`SELECT * FROM passport WHERE telegram = ${value}`,
      );
      return res;
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }
  });
  return profile;
};
