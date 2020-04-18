const ac = require('./rbac');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');
const template = require('../../views/message');

module.exports = class MessageController {
  // eslint-disable-next-line
  static async messageRevision(request, response, next) {
    // todo поддержать ревизии сообщения
  }
  // отображаем данные как есть
  static async messageRaw(request, response) {
    try {
      if (!request.user) {
        response.status(403).json({ message: 'unknown user' });
        return;
      }
      if (!request.params.uuid) {
        response.status(400).json({ message: 'unknown uuid' });
        return;
      }
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
          response.contentType(storyTable.content_type);
          switch (storyTable.content_type) {
            case 'text/plain': {
              response.send(storyTable.content.toString('utf8'));
              break;
            }
            default: {
              response.send(storyTable.content);
              break;
            }
          }
        } catch (error) {
          response.status(404).json({ message: error.message });
        }
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  // Для доступа к сообщениям, пользователю необходимо вести свой email и master password
  // отображение прикрепленных JSON-LD включающий ссылки на остальные документы
  static async message(request, response) {
    try {
      if (!request.user) {
        response.status(403).json({ message: 'unknown user' });
        return;
      }
      if (!request.params.uuid) {
        response.status(400).json({ message: 'unknown uuid' });
        return;
      }
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
            response.status(403).json({ message: 'forbidden' });
            return;
          }
          switch (request.headers.accept) {
            case 'application/schema+json':
            case 'application/json':
            default: {
              const json = await template(storyTable);
              response.status(200).json(json);
              return;
            }
          }
        } catch (error) {
          response.status(404).json({ message: error.message });
        }
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
