const { sql, pool } = require('../core/database');

module.exports = async (request, response, next) => {
  try {
    await pool.connect(async (connection) => {
      try {
        const storyTable = await connection.one(sql`
SELECT
    *
FROM 
    public.story
WHERE
    id = ${request.params.uuid}
`);
        switch (request.headers.accept) {
          case 'application/json': {
            return response.status(200).json(storyTable);
          }
          default: {
            return response.status(200).send(
              `
                <div>${storyTable.content.toString()}</div>
              `,
            );
          }
        }
      } catch (error) {
        return response.status(404).json({ message: error.message });
      }
    });
  } catch (error) {
    next(error);
  }
};
