/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
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

  return 'Данные очищены';
};
