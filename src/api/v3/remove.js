/**
 * удаление абстракта (может не работать если абстракт уже натурализован)
 *
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const { message_id, user } = requestObject.params;
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
  return 'Запись удалена';
};
