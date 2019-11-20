INSERT INTO passport (id) VALUES ('ff000000-0000-0000-0000-000000000000');

INSERT INTO bot (passport_id, activated, email, password, secret_key, secret_password)
VALUES (
'ff000000-0000-0000-0000-000000000000',
true,
'demo@gotointeractive.com',
'demo',
'demo',
'demo'
);

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
