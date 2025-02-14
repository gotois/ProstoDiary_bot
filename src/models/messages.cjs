const { messageDB } = require('../libs/database.cjs');

function createMessagesTable() {
  messageDB.exec(`
    CREATE TABLE if not exists messages(
      message_id INTEGER PRIMARY KEY,
      chat_id INTEGER,
      text TEXT,
      role TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    ) STRICT
  `);
}

try {
  createMessagesTable();
} catch (error) {
  console.warn(error);
}
/**
 * @description сохранение сообщения в базу данных
 * @param {object} message - объект сообщения
 * @param {number} message.messageId - идентификатор сообщения
 * @param {string} message.chatId - идентификатор чата
 * @param {string} message.text - сообщение
 * @param {'user' | 'assistant'} message.role - роль отправителя
 */
module.exports.saveMessage = ({ messageId, chatId, text, role }) => {
  const insert = messageDB.prepare(`
    INSERT INTO messages (message_id, chat_id, text, role)
    VALUES (:message_id, :chat_id, :text, :role)
  `);
  insert.run({
    message_id: messageId,
    chat_id: chatId,
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
/**
 * @description Очистка сообщений из базы данных по идентификатору сообщения
 * @param {number} messageId - идентификатор сообщения
 */
module.exports.clearMessageById = (messageId) => {
  const clear = messageDB.prepare(`
    DELETE FROM messages
    WHERE message_id = ?
  `);
  clear.run(messageId);
};
