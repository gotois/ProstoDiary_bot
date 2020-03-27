const { sql } = require('./sql');

module.exports = {
  selectByUserId(id) {
    return sql`
        select * from assistant where user_id = ${id}
    `;
  },
};
