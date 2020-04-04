const { sql } = require('./sql');

module.exports = {
  selectAssistantIdByUserPhone(userPhone) {
    const marketPlaceId = 'tg@gotointeractive.com';
    return sql`
      SELECT assistant.id FROM client.passport AS usr, client.bot AS bot, assistant.bot AS assistant, assistant.marketplace AS marketplace
      WHERE usr.phone = ${userPhone}
      AND marketplace.client_id = ${marketPlaceId}
      AND assistant.bot_user_email = bot.email
    `;
  },
  selectAssistantBotByEmail(bot_user_email) {
    return sql`SELECT
    *
FROM
    assistant.bot
    WHERE bot_user_email = ${bot_user_email}
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
  selectMarketAssistant(client_id) {
    return sql`SELECT * FROM assistant.marketplace WHERE client_id = ${client_id}`;
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
