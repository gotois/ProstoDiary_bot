const { sql } = require('../core/database');

module.exports = {
  createLD(jsonld) {
    return sql`
INSERT INTO data.ld
    (jsonld)
VALUES 
    (
    ${JSON.stringify(jsonld)}::jsonb
    )
RETURNING id
`;
  },
};
