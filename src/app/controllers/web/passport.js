const { sql, pool } = require('../../../db/sql');

// todo deprecated?
module.exports = async (request, response, next) => {
  try {
    // todo использовать date для выборки по датам
    let _date;
    if (request.params.date === 'latest') {
      _date = Date.now();
    }
    await pool.connect(async (connection) => {
      try {
        const ldTable = await connection.one(sql`
SELECT
    jsonld
FROM
    ld
WHERE
    passport_id = ${request.params.uuid}
`);
        // todo: брать из View person
        const personLD = {
          ...ldTable.jsonld,
          '@context': 'https://schema.org',
          '@type': 'Person',
        };
        response.status(200).json(personLD);
      } catch (error) {
        response.status(404).json({ message: error.message });
      }
    });
  } catch (error) {
    next(error);
  }
};
