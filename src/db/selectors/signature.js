const { sql } = require('../sql');

module.exports = {
  create({ assistant_marketplace_id, verification, fingerprint }) {
    return sql`
    INSERT INTO marketplace.signature
    (assistant_marketplace_id, verification, fingerprint)
    VALUES
    (${assistant_marketplace_id}, ${verification}, ${fingerprint})
    `;
  },
  selectByVerification(verification) {
    return sql`
    SELECT * FROM marketplace.signature WHERE
    verification = ${verification}
    `;
  },
};
