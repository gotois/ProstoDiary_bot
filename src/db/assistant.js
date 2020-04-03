const { sql } = require('./sql');

module.exports = {
  // rename to marketplace
  selectAssistantById(client_id) {
    return sql`SELECT
    *
FROM
    assistant.marketplace
    WHERE client_id = ${client_id}
`;
  },
  selectAll() {
    return sql`SELECT
    *
FROM
    assistant.marketplace
`;
  },
  /**
   * @param {string} object - param object
   * @param {string} object.client_id - assistant name
   * @param {string} object.client_secret - assistant secret
   * @param {string} object.application_type - application_type
   * @param {Array<string>} object.response_types - response types
   * @param {string} object.token_endpoint_auth_method - token_endpoint_auth_method
   * @param {Array<string>} object.grant_types - grant_types
   * @param {Array<string>} object.redirect_uris - redirect uris
   * @param {string} [homepage] - assistant homepage
   * @returns {*}
   */
  createAssistant(
    {
      client_id,
      client_secret,
      application_type,
      response_types,
      token_endpoint_auth_method,
      grant_types,
      redirect_uris,
    },
    homepage,
  ) {
    return sql`INSERT INTO assistant.marketplace
        (client_id, client_secret, application_type, response_types, token_endpoint_auth_method, grant_types, redirect_uris, homepage)
        VALUES (
          ${client_id},
          ${client_secret},
          ${application_type},
          ${sql.array(response_types, 'text')},
          ${token_endpoint_auth_method},
          ${sql.array(grant_types, 'text')},
          ${sql.array(redirect_uris, 'text')},
          ${homepage}
        )
        `;
  },
  exist(user_id) {
    return sql`SELECT 1 from assistant.marketplace where client_id = ${user_id}`;
  },
  updateAssistantBotToken(bot_user_email, token) {
    return sql`UPDATE assistant.bot
          SET token = ${token}
          WHERE bot_user_email = ${bot_user_email}
    `;
  },
  createAssistantBot({ assistant_marketplace_id, token, bot_user_email }) {
    return sql`INSERT INTO assistant.bot
    (assistant_marketplace_id, token, bot_user_email)
    VALUES (
      ${assistant_marketplace_id}, ${token}, ${bot_user_email}
    )
    `;
  },
};
