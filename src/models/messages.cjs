const { messageDB } = require('../libs/database.cjs');

/**
 * @description сохранение сообщения в базу данных
 * @param {object} message - объект сообщения
 * @param {number} message.message_id - идентификатор сообщения
 * @param {number} message.chat_id - идентификатор чата
 * @param {string} message.message_text - текст сообщения
 */
module.exports.saveMessage = ({ message_id, chat_id, message_text }) => {
  const insert = messageDB.prepare(`
    INSERT INTO messages (message_id, chat_id, message_text)
    VALUES (:message_id, :chat_id, :message_text)
  `);
  insert.run({
    message_id: message_id,
    chat_id: chat_id,
    message_text: message_text,
  });
};
