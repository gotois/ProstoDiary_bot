const bot = require('../../../include/telegram-bot/bot');
const { pool } = require('../../../db/sql');
// eslint-disable-next-line
const { SERVER } = require('../../../environment');
const passportQueries = require('../../../db/passport');
const imapService = require('../../../services/imap.service');
const logger = require('../../../lib/log');
/**
 * @todo в нынешнем виде устарело, перенести в email assistant
 * @param {object} info - mail info
 * @returns {Promise<void>}
 */
const delivered = async (info) => {
  logger.info(delivered.name);
  logger.info(info);
  const showTelegram = !info.test && info.chat_id && info.telegram_message_id;
  // todo проверять хуку по `info.sg_event_id` === 'ZGVsaXZlcmVkLTAtOTk2MjYyMC1aM090YUpKZFRGcTg2RkhEQm9xREFnLTA'
  // @see https://github.com/gotois/ProstoDiary_bot/issues/358
  // ...
  try {
    const botTable = await pool.connect(async (connection) => {
      const botTable = await connection.maybeOne(
        passportQueries.selectBotByEmail(info.email),
      );
      if (!botTable) {
        // пропускаем письма отправленные пользователю
        const userTable = await connection.maybeOne(
          passportQueries.selectUserByEmail(info.email),
        );
        // пропускаем сгенерированные ботом письма пользователю
        if (userTable) {
          return;
        }
        throw new Error('Unknown bot');
      }
      return botTable;
    });
    if (!botTable) {
      return;
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
    const links = [];
    for (const mail of emails) {
      // fixme категории больше не используются!
      // В зависимости от полученной категории разная логика работы с письмом
      if (info.category.includes('user-transaction-write')) {
        // fixme использовать storyLogger
        // const story = new Story({
        //   ...mail,
        //   ...info,
        // });
        // const id = await story.commit();
        // links.push({
        //   text: 'show message',
        //   url: `${SERVER.HOST}:${SERVER.PORT}/message/${id}`,
        // });
        await imap.remove(mail.uid);
      } else if (info.category.includes('user-transaction-read')) {
        // todo если пришла transaction-read, то получаем возможность делать read
        //  ...
      }
    }
    if (showTelegram) {
      logger.info('bot.editMessageText');
      await bot.editMessageText('✅️', {
        chat_id: info.chat_id,
        message_id: info.telegram_message_id,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [links],
        },
      });
    }
  } catch (error) {
    if (showTelegram) {
      await bot.editMessageText('⚠️', {
        chat_id: info.chat_id,
        message_id: info.telegram_message_id,
      });
    }
    throw error;
  }
};

module.exports = delivered;
