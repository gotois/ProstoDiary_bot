const bot = require('../core/bot');
const Vzor = require('../core/vzor');
const { pool, sql } = require('../core/database');
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
          const botCredentials = await pool.connect(async (connection) => {
            const botTable = await connection.one(sql`
      SELECT password, email, passport_id FROM bot WHERE email = ${info.email};
    `);
            return botTable;
          });
          const mailMap = await Vzor.search(
            {
              user: botCredentials.email,
              password: botCredentials.password,
              markSeen: true,
            },
            ['ALL', ['HEADER', 'MESSAGE-ID', info['smtp-id']]],
          );
          await Vzor.readEmail(mailMap);
          // for update message
          if (!info.test && info.chat_id && info.telegram_message_id) {
            await bot.editMessageText('✅', {
              chat_id: info.chat_id,
              message_id: info.telegram_message_id,
            });
          }
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
