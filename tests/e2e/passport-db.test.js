const { pool, sql } = require('../../src/core/database');

// TODO: используя https://github.com/marak/Faker.js/
module.exports = async (t) => {
  t.timeout(5000);

  await pool.connect(async (connection) => {
    await connection.query(
      sql`
        INSERT INTO jsonld
    (id, context, type, email, url, same_as)
    VALUES ('https://demo.gotointeractive.com/', '{ "@vocab": "http://schema.org/" }', 'Person', 'denis@baskovsky.ru', 'http://denis.baskovsky.ru/', array['sssd'])
    RETURNING id

INSERT INTO ld (passport_id, jsonld)
VALUES (
'ff000000-0000-0000-0000-000000000000',
'{
  "name": "demo",
  "email": "mailto://demo@gotointeractive.com",
  "@context": "https://json-ld.org/contexts/person.jsonld",
  "nickname": "demo",
  "http://schema.org/birthDate": {
    "@id": "/2019-11-20"
  }
}'::jsonb
);

        
        INSERT INTO passport (id) VALUES ('00000000-0000-0000-0000-000000000000');
        
        INSERT INTO bot (passport_id, activated, email, password, secret_key, secret_password)
        VALUES (
        '00000000-0000-0000-0000-000000000000',
        true,
        'demo@gotointeractive.com',
        'demo',
        'demo',
        'demo'
        );
      `,
    );
  });
};
