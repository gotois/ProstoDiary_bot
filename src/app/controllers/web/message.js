const ac = require('../../middlewares/rbac');
const mc = require('../../middlewares/memcache');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const passportQueries = require('../../../db/selectors/passport');
const templateMessage = require('../../views/message');
const templateList = require('../../views/message-list');
/**
 * Фильтруем выдачу в зависимост от доступа RBAC
 *
 * @param {jsonld} data - jsonld
 * @param {boolean} isOwner - isOwner
 * @param {*} role - role
 * @returns {object}
 */
const filter = (data, isOwner, role) => {
  let permission;
  if (isOwner) {
    permission = ac.can(role).readOwn('message');
  } else {
    permission = ac.can(role).readAny('message');
  }
  if (!permission.granted) {
    throw new Error('forbidden');
  }
  return permission.filter(data);
};

module.exports = class MessageController {
  /**
   * Отдаваем последние сообщения по дате
   *
   * @param {Request} request - request
   * @param {Response} response - response
   */
  static async date(request, response) {
    try {
      const { from, to, bot } = request.params;
      const { storyTable } = await pool.connect(async (connection) => {
        const roleTable = await connection.one(
          passportQueries.selectRoleByEmail(request.user),
        );
        const { role } = roleTable;
        if (!role) {
          throw new Error('forbidden');
        }
        const storyTable = await connection.many(
          storyQueries.selectCreatorStoryByDate({
            creator: bot,
            from,
            to,
          }),
        );
        return {
          storyTable,
          role,
        };
      });
      response.contentType('application/ld+json');
      response.send(templateList(storyTable));
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * Отдаваем последние сообщения
   *
   * @param {Request} request - request
   * @param {Response} response - response
   */
  static async latest(request, response) {
    try {
      const { limit = '10' } = request.params;
      const { storyTable, role } = await pool.connect(async (connection) => {
        const { role } = await connection.maybeOne(
          passportQueries.selectRoleByEmail(request.user),
        );
        if (!role) {
          throw new Error('forbidden');
        }
        const storyTable = await connection.many(
          storyQueries.selectLatestStories(limit),
        );
        return {
          storyTable,
          role,
        };
      });
      response.contentType('application/ld+json');
      const key = 'latest:' + role + request.user + request.params.limit;
      const prime = await mc.get(key);
      if (prime && prime.value) {
        response.send(JSON.parse(prime.value));
      } else {
        const temporary = templateList(storyTable);
        const values = filter(temporary, role);
        await mc.set(key, JSON.stringify(values), { expires: 500 });
        response.send(values);
      }
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * отображаем первоначальные данные какими они были отправлены
   *
   * @param {Request} request - request
   * @param {Response} response - response
   */
  static async messageRaw(request, response) {
    try {
      if (!request.params.uuid) {
        throw new Error('unknown uuid');
      }
      const { storyTable } = await pool.connect(async (connection) => {
        const { role } = await connection.maybeOne(
          passportQueries.selectRoleByEmail(request.user),
        );
        if (!role) {
          throw new Error('forbidden');
        }
        const storyTable = await connection.one(
          storyQueries.selectStoryById(request.params.uuid),
        );
        return {
          storyTable,
        };
      });
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
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * Для доступа к сообщениям, пользователю необходимо вести свой email и master password
   * отображение прикрепленных JSON-LD включающий ссылки на остальные документы
   *
   * @todo поддержать ревизии сообщения
   * @param {Request} request - request
   * @param {Response} response - response
   */
  static async message(request, response) {
    try {
      if (!request.params.uuid) {
        throw new Error('unknown uuid');
      }
      const { role, storyTable, isOwner } = await pool.connect(
        async (connection) => {
          const { role } = await connection.maybeOne(
            passportQueries.selectRoleByEmail(request.user),
          );
          if (!role) {
            throw new Error('forbidden');
          }
          const storyTable = await connection.one(
            storyQueries.selectStoryById(request.params.uuid),
          );
          return {
            role,
            storyTable,
            isOwner: false, // todo использовать данные из storyTable.creator и связывать с хозяином бота
          };
        },
      );
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
            const temporary = await templateMessage(storyTable, role);
            const values = filter(temporary, isOwner, role);
            await mc.set(key, JSON.stringify(values), { expires: 500 });
            response.send(values);
          }
          break;
        }
      }
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
