const jsonrpc = require('../core/jsonrpc');
const { pool, sql } = require('../core/database');

module.exports = async (request, response) => {
  const bot = await pool.connect(async (connection) => {
    const data = await connection.maybeOne(sql`
SELECT
    passport_id
FROM
    bot
WHERE
    email = ${request.user + '@gotointeractive.com'}
`);
    return data;
  });
  if (!bot) {
    return response.sendStatus(401).send('401 Unauthorized');
  }
  jsonrpc.server.call(
    request.body,
    { user: bot.passport_id },
    (error, result) => {
      if (error) {
        return response.status(500).json(error);
      }
      return response.send(result);
    },
  );
};
