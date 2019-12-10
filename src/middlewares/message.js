const { sql, pool } = require('../core/database');

module.exports = async (request, response, next) => {
  try {
    await pool.connect(async (connection) => {
      try {
        const messageTable = await connection.one(sql`
SELECT
    * 
FROM 
    data.message
WHERE 
    id = ${request.params.uuid}
`);
        return response.status(200).json(messageTable);
      } catch (error) {
        return response.status(404).json({ message: error.message });
      }
    });
  } catch (error) {
    next(error);
  }
};
