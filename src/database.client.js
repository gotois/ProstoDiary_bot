const pg = require('pg');
const config = require('./database.config');

const mode = process.env.NODE_ENV;
let DATABASE_URL;
// отличается одним символом @
if (mode === 'production') {
  DATABASE_URL = `postgres://${config.user}:${config.password}.${config.host}:${config.port}/${config.database}`;
} else {
  DATABASE_URL = `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

module.exports = new pg.Client(DATABASE_URL);
