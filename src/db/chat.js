const { sql } = require('./sql');

module.exports = {
  createChat({ id, name, assistant_id }) {
    return sql`
      INSERT INTO assistant.chat
      (id, name, assistant_bot_id)
      VALUES
      (
      ${id},
      ${name},
      ${assistant_id}
      )
    `;
  },
  /**
   * @param {string} id - chat id
   * @returns {*}
   */
  selectByChatId(id) {
    return sql`
      SELECT * FROM assistant.bot AS assistant, assistant.chat AS chat WHERE chat.id = ${id}
    `;
  },
};
