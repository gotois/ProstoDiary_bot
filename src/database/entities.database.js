const crypt = require('../services/crypt.service');
const { $$, pool } = require('.');
require('../../types');
/**
 * @param {number} telegram_user_id - user id
 * @returns {Promise<Array>}
 */
const getAll = async (telegram_user_id, sorting = 'ASC') => {
  const result = await $$(
    `SELECT DISTINCT user_t.context->>'queryText' AS TEXT, history.created_at AS DATE
     FROM bot_story AS bot_t, user_story AS user_t
     JOIN history
     ON history.user_story_id = user_t.id
     WHERE bot_t.telegram_user_id = $1
     ORDER BY history.created_at ASC`,
    [telegram_user_id],
  );
  // TODO: надо сразу декодировать
  return result.rows;
};
/**
 * @param {number} telegram_user_id - user id
 * @param {string|Date} date - date
 * @example
 * get(111, '2016-12-01');
 *
 * @returns {Promise<Array>}
 */
const _get = async (telegram_user_id, date) => {
  switch (date.constructor) {
    case Date: {
      date = date.toJSON().substr(0, 10);
      break;
    }
    case String: {
      break;
    }
    default: {
      throw new TypeError('Wrong type');
    }
  }
  // todo: День начинается с рассвета и до следующего рассвета (вместо привычного дня времени)
  // fixme: лучше сделать -12 часов и +12 часов
  const from = `${date} 00:00:00`;
  const until = `${date} 23:59:59`;
  const result = await $$(
    `SELECT DISTINCT user_t.context->>'queryText' AS TEXT, user_t.telegram_message_id
     FROM user_story as user_t, history as history_t, bot_story as bot_t
     WHERE bot_t.telegram_user_id = $1 AND history_t.created_at BETWEEN $2 AND $3`,
    [telegram_user_id, from, until],
  );
  // TODO: надо сразу декодировать
  // const decodeRows = rows.map(({ entry }) => {
  //   return crypt.decode(entry);
  // });
  return result.rows;
};
/**
 * @param {storyJSON} storyJSON - story JSON
 * @returns {Promise<Array>}
 */
const _post = async (storyJSON) => {
  const {
    version,
    author,
    publisher,
    jurisdiction,
    telegram_user_id,
    telegram_message_id,
    type,
    context,
  } = storyJSON;
  const client = await pool.connect();
  try {
    const result = await $$(
      `SELECT id FROM bot_story
    WHERE version = $1 AND telegram_user_id = $2
    LIMIT 1`,
      [version, telegram_user_id],
    );
    await client.query('BEGIN');
    let botStoryId;
    if (result.rows.length > 0) {
      botStoryId = result.rows[0].id;
    } else {
      const botStoryResult = await client.query({
        name: 'create-bot-story',
        text: `INSERT INTO bot_story (version, author, publisher, jurisdiction, telegram_user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
        values: [version, author, publisher, jurisdiction, telegram_user_id],
      });
      botStoryId = botStoryResult.rows[0].id;
    }
    const userStoryResult = await client.query({
      name: 'create-user-story',
      text: `INSERT INTO user_story (type, telegram_message_id, context)
             VALUES ($1, $2, $3)
             RETURNING id`,
      values: [type, telegram_message_id, context],
    });
    const historyResult = await client.query({
      name: 'create-history',
      text: `INSERT INTO history (bot_story_id, user_story_id)
             VALUES ($1, $2)
             RETURNING *`,
      values: [botStoryId, userStoryResult.rows[0].id],
    });
    await client.query('COMMIT');
    return historyResult.rows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
/**
 * @param {storyJSON} storyJSON - story
 * @returns {Promise<undefined>}
 */
const _put = async (storyJSON) => {
  const { type, context, telegram_message_id } = storyJSON;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // TODO: нужна процедура, которая поверяет соответствие переданной версии текущего бота и привязанной версии бота к bot_story.
    //  В случае несовпадения UPDATE не срабатывает
    await client.query({
      name: 'update-user-story',
      text: `UPDATE user_story
             SET type = $1, context = $2
             WHERE (telegram_message_id = $3)`,
      values: [type, context, telegram_message_id],
    });
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
/**
 * @todo сейчас удаляется только user_story, а надо еще и bot_story и history
 * @param {number} userId - user id
 * @param {number} telegram_message_id - telegram entry id
 * @returns {Promise<undefined>}
 */
const _delete = async (userId, telegram_message_id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query({
      name: 'delete-user-story',
      text: `DELETE FROM user_story
             WHERE (telegram_message_id = $1)
             RETURNING id`,
      values: [telegram_message_id],
    });
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
/**
 * Удаление целиком всей истории пользователя целиком
 *
 * @param {number} telegram_user_id - id user
 * @returns {Promise<undefined>}
 */
const clear = async (telegram_user_id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const botStoryResult = await client.query({
      name: 'delete-bot-story',
      text: `DELETE FROM bot_story
             WHERE telegram_user_id = $1
             RETURNING id`,
      values: [telegram_user_id],
    });
    const userStoryResult = await client.query({
      name: 'delete-user-story',
      text: `DELETE FROM user_story
             WHERE id = $1
             RETURNING id`,
      values: [botStoryResult.rows[0].id],
    });
    await client.query({
      name: 'delete-history',
      text: `DELETE FROM history
             WHERE bot_story_id = $1 AND user_story_id = $2`,
      values: [botStoryResult.rows[0].id, userStoryResult.rows[0].id],
    });
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  post: _post,
  get: _get,
  put: _put,
  delete: _delete,
  getAll,
  clear,
};
