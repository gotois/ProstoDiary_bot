const { sql } = require('../sql');

module.exports = {
  selectAssistantIdByUserPhone(userPhone) {
    const marketPlaceId = 'tg@gotointeractive.com';
    return sql`
      SELECT assistant.id FROM client.passport AS usr, client.bot AS bot, assistant.bot AS assistant, marketplace.client AS marketplace
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
  updateAssistantBotToken(bot_user_email, token) {
    return sql`UPDATE assistant.bot
          SET token = ${token}
          WHERE bot_user_email = ${bot_user_email}
    `;
  },
  createAssistantBot({
    assistant_marketplace_id,
    token,
    bot_user_email,
    privateKeyBase58,
    publicKeyBase58,
  }) {
    return sql`INSERT INTO assistant.bot
    (assistant_marketplace_id, token, bot_user_email, private_key, public_key)
    VALUES (
      ${assistant_marketplace_id}, ${token}, ${bot_user_email}, ${privateKeyBase58}, ${publicKeyBase58}
    )
    `;
  },
};
