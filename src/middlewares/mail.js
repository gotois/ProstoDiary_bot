const bot = require('../core/bot');
const Vzor = require('../core/vzor');
const { pool, sql } = require('../core/database');
/**
 * @param {object} info - mail info
 * @returns {Promise<void>}
 */
const processedMail = async (info) => {
  let resultMessage;
  try {
    const { email, password } = await pool.connect(async (connection) => {
      const botTable = await connection.one(sql`
      SELECT password, email, passport_id FROM bot WHERE email = ${info.email};
    `);
      return botTable;
    });
    const mailMap = await Vzor.search(
      {
        user: email,
        password: password,
        markSeen: true, // нужно затем удалять просмотренные письма?
      },
      ['ALL', ['HEADER', 'MESSAGE-ID', info['smtp-id']]],
    );
    // в зависимости от полученной категории выполняем разные действия
    if (info.category.includes('transaction')) {
      await Vzor.readEmail(mailMap);
      resultMessage = '✅';
    } else {
      resultMessage = '❓';
    }
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
/**
 * @param {object} request - request
 * @param {object} response - response
 * @param {Function} next - callback
 * @returns {Promise<undefined>}
 */
module.exports = async (request, response, next) => {
  try {
    for (const info of request.body) {
      switch (info.event) {
        case 'processed': {
          await processedMail(info);
          break;
        }
        case 'delivered': {
          break;
        }
        default: {
          break;
        }
      }
    }
    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
