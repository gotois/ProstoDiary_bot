const ac = require('./rbac');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/story');
const passportQueries = require('../../../db/passport');
const template = require('../../views/message');

// Для доступа к сообщениям, пользователю необходимо вести свой email и master password
// отображение прикрепленных JSON-LD включающий ссылки на остальные документы
module.exports = async (request, response, next) => {
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
        // todo показывать отдельный список для пользователя/бота, и для сторонних людей - https://github.com/gotois/ProstoDiary_bot/issues/280#issuecomment-558048329
        switch (request.headers.accept) {
          case 'application/schema+json':
          case 'application/json': {
            response.status(200).json(storyTable);
            return;
          }
          default: {
            response.status(200).send(template(storyTable));
            return;
          }
        }
      } catch (error) {
        response.status(404).json({ message: error.message });
      }
    });
  } catch (error) {
    next(error);
  }
};
