const { messageDB } = require('../libs/database.cjs');

function createMessagesTable() {
  messageDB.exec(`
    CREATE TABLE if not exists messages(
      message_id INTEGER PRIMARY KEY,
      chat_id INTEGER,
      message TEXT,
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
 * @description Сохранение сообщения в локальную базу данных
 * @param {object} message - объект сообщения
 */
module.exports.saveMessage = (message) => {
  const insert = messageDB.prepare(`
    INSERT INTO messages (message_id, message, chat_id, role)
    VALUES (:message_id, :message, :chat_id, :role)
  `);
  insert.run({
    message_id: message.message_id,
    chat_id: message.chat.id,
    message: JSON.stringify(message),
    role: message.from.is_bot ? 'assistant' : 'user', // {'user' | 'assistant'}
  });
};
/**
 * @description извлечение сообщений из базы данных
 * @param {number} userId - идентификатор чата
 * @returns {object[]} - массив сообщений
 */
module.exports.getMessages = (userId) => {
  const select = messageDB.prepare(`
    SELECT message_id, chat_id, message, role
    FROM messages
    WHERE chat_id == ?
  `);
  return select.all(userId);
};
/**
 * @description Очистка сообщений из базы данных по идентификатору сообщения
 * @param {number} chatId - идентификатор пользователя
 */
module.exports.clearMessageById = (chatId) => {
  const clear = messageDB.prepare(`
    DELETE FROM messages
    WHERE chat_id == ?
  `);
  clear.run(chatId);
};
