const bot = require('../../core/bot');
const { pool } = require('../../core/database');
const { client } = require('../../core/jsonrpc');
const botQueries = require('../../db/bot');
const imapService = require('../../services/imap.service');
const logger = require('../../services/logger.service');
/**
 * @param {object} info - mail info
 * @returns {Promise<void>}
 */
const processed = async (info) => {
  let resultMessage;
  try {
    // в зависимости от полученной категории разная логика работы с письмом
    if (!info.category.includes('transaction')) {
      return;
    }
    const botTable = await pool.connect(async (connection) => {
      const botTable = await connection.one(
        botQueries.selectByEmail(info.email),
      );
      return botTable;
    });
    const mailMap = await imapService.search({
        user: botTable.email,
        password: botTable.password,
        markSeen: true, // нужно затем удалять просмотренные письма?
      },
      ['ALL', ['HEADER', 'MESSAGE-ID', info['smtp-id']]],
    );
    for (const [uid, mail] of mailMap) {
      const messages = await imapService.read(mail, botTable.secret_key);
      for (const { subject, body, contentType } of messages) {
        const { error, result } = await client.request('story', {
          subject,
          body,
          contentType,
          uid,
        });
        logger.info(result);
        if (error) {
          resultMessage = error.message;
          throw new Error(error);
        }
      }
    }
    resultMessage = '✅';
  } catch (error) {
    resultMessage = '⚠️';
    throw error;
  } finally {
    if (!info.test && info.chat_id && info.telegram_message_id) {
      await bot.editMessageText(resultMessage, {
        chat_id: info.chat_id,
        message_id: info.telegram_message_id,
      });
    }
  }
};

module.exports = processed;
