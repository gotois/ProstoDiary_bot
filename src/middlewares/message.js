const { pool } = require('../core/database');
const storyQueries = require('../db/story');

// todo нужен access control по `request.user`
module.exports = async (request, response, next) => {
  try {
    await pool.connect(async (connection) => {
      try {
        const storyTable = await connection.one(
          storyQueries.selectStoryById(request.params.uuid),
        );
        switch (request.headers.accept) {
          case 'application/json': {
            return response.status(200).json(storyTable);
          }
          default: {
            // todo отдельный шаблонизатор
            let html = '';
            switch (storyTable.content_type) {
              case 'plain/text': {
                html += storyTable.content.toString();
                break;
              }
              case 'image/jpeg': {
                html += `<img src="data:image/jpeg;base64, ${storyTable.content.toString(
                  'base64',
                )}"/>`;
                break;
              }
              default: {
                html += 'undefined type story';
                break;
              }
            }
            return response.status(200).send(
              `
                <div>${html}</div>
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
