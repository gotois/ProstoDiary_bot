const { sql } = require('../core/database');

module.exports = {
  create(message) {
    return sql`
INSERT INTO data.message
    (tags, raw, ld_ids)
VALUES 
    (
    ${message.tags},
    ${message.raw},
    ${message.ld_ids}
    )
RETURNING id, raw
`;
  },
};
