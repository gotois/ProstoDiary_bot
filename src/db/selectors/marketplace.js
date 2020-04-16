const validator = require('validator');
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
  /**
   * @param {string} object - param object
   * @param {string} object.client_id - assistant name
   * @param {string} object.client_secret - assistant secret
   * @param {string} object.application_type - application_type
   * @param {Array<string>} object.response_types - response types
   * @param {string} object.token_endpoint_auth_method - token_endpoint_auth_method
   * @param {Array<string>} object.grant_types - grant_types
   * @param {Array<string>} object.redirect_uris - redirect uris
   * @param {string} [object.homepage] - assistant homepage
   * @returns {*}
   */
  createAssistant({
    client_id,
    client_secret,
    application_type,
    response_types,
    token_endpoint_auth_method,
    grant_types,
    redirect_uris,
    homepage,
  }) {
    if (!validator.isEmail(client_id)) {
      throw new TypeError('Wrong client_id');
    }
    if (!Array.isArray(response_types)) {
      throw new TypeError('Wrong response_types');
    }
    if (!Array.isArray(grant_types)) {
      throw new TypeError('Wrong grant_types');
    }
    if (!Array.isArray(redirect_uris)) {
      throw new TypeError('Wrong redirect_uris');
    }
    redirect_uris.forEach((uri) => {
      if (!validator.isURL(uri)) {
        throw new TypeError('Wrong uri: ' + uri);
      }
    });
    return sql`INSERT INTO marketplace.client
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
    return sql`SELECT * FROM marketplace.client WHERE client_id = ${client_id}`;
  },
};
