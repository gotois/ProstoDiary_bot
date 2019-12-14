const bot = require('../../core/bot');
const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
const imapService = require('../../services/imap.service');
const logger = require('../../services/logger.service');
const Story = require('../../models/story');
/**
 * @param {object} info - mail info
 * @returns {Promise<void>}
 */
const delivered = async (info) => {
  logger.info(delivered.name);
  console.log('info.email', info);
  let resultMessage;
  try {
    const botTable = await pool.connect(async (connection) => {
      const botTable = await connection.maybeOne(
        passportQueries.selectBotByEmail(info.email),
      );
      return botTable;
    });
    if (!botTable) {
      throw new Error('Unknown bot');
    }
    const imap = imapService(
      {
        user: botTable.email,
        password: botTable.password,
      },
      botTable.secret_key,
    );
    const emails = await imap.search([
      'ALL',
      ['HEADER', 'MESSAGE-ID', info['smtp-id']],
    ]);
    if (emails.size === 0) {
      throw new Error('Empty mailbox');
    }
    for (const mail of emails) {
      // В зависимости от полученной категории разная логика работы с письмом
      if (info.category.includes('transaction-write')) {
        // если пришла transaction-write, то получаем возможность делать write
        const story = new Story({
          ...mail,
          ...info,
        });
        await story.commit();
        await imap.remove(mail.uid);
      } else if (info.category.includes('transaction-read')) {
        // todo если пришла transaction-read, то получаем возможность делать read
        //  ...
      }
    }
    resultMessage = '✅'; // 'Сообщение успешно сохранено ' + id;
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

module.exports = delivered;
