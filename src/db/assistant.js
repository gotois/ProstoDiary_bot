// todo эти запросы должны происходить на стороне TG ассистента
const { sql } = require('../db/database');

module.exports = {
  selectByUserId(id) {
    return sql`
        select * from assistant where user_id = ${id}
    `;
  },
};
