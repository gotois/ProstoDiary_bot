const ac = require('./rbac');
const mc = require('../../middlewares/memcache');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');
const template = require('../../views/message');
const templateList = require('../../views/message-list');

module.exports = class MessageController {
  // Отдаваем последние сообщения по дате
  static async date(request, response) {
    try {
      const { from, to, bot } = request.params;
      await pool.connect(async (connection) => {
        const roleTable = await connection.one(
          passportQueries.selectRoleByEmail(request.user),
        );
        const { role } = roleTable;
        if (!role) {
          response.status(403).json({ message: 'forbidden' });
          return;
        }
        const storyTable = await connection.many(
          storyQueries.selectCreatorStoryByDate({
            creator: bot,
            from,
            to,
          }),
        );
        response.contentType('application/ld+json');
        response.send(templateList(storyTable));
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  // Отдаваем последние сообщения
  static async latest(request, response) {
    try {
      const { limit = '10' } = request.params;
      await pool.connect(async (connection) => {
        const { role } = await connection.maybeOne(
          passportQueries.selectRoleByEmail(request.user),
        );
        if (!role) {
          response.status(403).json({ message: 'forbidden' });
          return;
        }
        const storyTable = await connection.many(
          storyQueries.selectLatestStories(limit),
        );
        response.contentType('application/ld+json');
        response.send(templateList(storyTable));
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  // отображаем первоначальные данные какими они были отправлены
  static async messageRaw(request, response) {
    try {
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
            case 'application/vnd.geo+json': {
              response.json(JSON.parse(storyTable.content.toString('utf8')));
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
  // todo поддержать ревизии сообщения
  static async message(request, response) {
    try {
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
              const key = 'message:' + role + request.params.uuid;
              const prime = await mc.get(key);
              response.contentType('application/ld+json');
              if (prime && prime.value) {
                response.send(JSON.parse(prime.value));
              } else {
                const values = await template(storyTable);
                await mc.set(key, JSON.stringify(values), { expires: 500 });
                response.send(values);
              }
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
