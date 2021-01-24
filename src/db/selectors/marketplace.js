// FIXME deprecated
const { sql } = require('../sql');

module.exports = {
  selectByClientId(clientId) {
    return sql`
      SELECT * FROM marketplace.client
      WHERE client_id = ${clientId}
    `;
  },
  selectAll() {
    return sql`SELECT
    *
FROM
    marketplace.client
`;
  },
  check(client_id, client_secret) {
    return sql`SELECT
    *
FROM
    marketplace.client
    WHERE client_id = ${client_id} AND client_secret = ${client_secret}
`;
  },
};
