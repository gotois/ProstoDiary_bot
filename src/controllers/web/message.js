const ac = require('./rbac');
const { pool } = require('../../db/database');
const storyQueries = require('../../db/story');
const passportQueries = require('../../db/passport');

// Для доступа к сообщениям, пользователю необходимо вести свой email и master password
module.exports = async (request, response, next) => {
  try {
    await pool.connect(async (connection) => {
      const { role } = await connection.maybeOne(
        passportQueries.selectRoleByEmail(request.user),
      );
      if (!role) {
        response.status(403).json({ message: 'forbidden' });
        return;
      }
      try {
        const storyTable = await connection.one(
          storyQueries.selectStoryById(request.params.uuid),
        );
        const permission = ac.can(role).readOwn('message');
        // todo поправить новую выдачу
        // if (storyTable.publisher_email === request.user) {
        //   permission = ac.can(role).readOwn('message');
        // } else {
        //   permission = ac.can(role).readAny('message');
        // }
        if (!permission.granted) {
          return response.status(403).json({ message: 'forbidden' });
        }
        // todo показывать отдельный список для пользователя/бота, и для сторонних людей - https://github.com/gotois/ProstoDiary_bot/issues/280#issuecomment-558048329
        switch (request.headers.accept) {
          case 'application/schema+json':
          case 'application/json': {
            return response.status(200).json(storyTable);
          }
          default: {
            // todo отдельный шаблонизатор
            let html = '';

            html += `<h1>${JSON.stringify(storyTable.categories)}</h1>`;
            html += `<h2>${JSON.stringify(storyTable.context)}</h2>`;
            switch (storyTable.content_type) {
              case 'text/plain':
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
            html += `
                <div>
                  <p>STATUS: ${storyTable.status}</p>
                  <p>created_at: ${storyTable.created_at}</p>
                </div>
            `;
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
