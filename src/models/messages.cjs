const { messageDB } = require('../libs/database.cjs');

/**
 * @description сохранение сообщения в базу данных
 * @param {object} message - объект сообщения
 * @param {number} message.messageId - идентификатор сообщения
 * @param {string} message.actorId - идентификатор чата
 * @param {string} message.text - сообщение
 * @param {'user' | 'assistant'} message.role - роль отправителя
 */
module.exports.saveMessage = ({ messageId, actorId, text, role }) => {
  const insert = messageDB.prepare(`
    INSERT INTO messages (message_id, chat_id, text, role)
    VALUES (:message_id, :chat_id, :text, :role)
  `);
  insert.run({
    message_id: messageId,
    chat_id: actorId,
    text: text,
    role: role,
  });
};
/**
 * @description извлечение сообщений из базы данных
 * @param {number} userId - идентификатор чата
 * @returns {object[]} - массив сообщений
 */
module.exports.getMessages = (userId) => {
  const select = messageDB.prepare(`
    SELECT message_id, chat_id, text, role
    FROM messages
    WHERE chat_id = ?
  `);
  return select.all(userId);
};
