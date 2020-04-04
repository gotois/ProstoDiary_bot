const { sql } = require('./sql');

module.exports = {
  createChat({ id, name, assistant_bot_id }) {
    return sql`
      INSERT INTO assistant.chat
      (id, name, assistant_bot_id)
      VALUES
      (
      ${id},
      ${name},
      ${assistant_bot_id}
      )
    `;
  },
  /**
   * @param {string} id - chat id
   * @returns {*}
   */
  selectByChatId(id) {
    return sql`
      SELECT * FROM assistant.bot AS assistant, assistant.marketplace AS marketplace, assistant.chat AS chat WHERE chat.id = ${id} AND assistant.assistant_marketplace_id = marketplace.id
    `;
  },
};
