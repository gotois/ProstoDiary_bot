const bot = require('../core/bot');
const { pool } = require('../core/database');
const botQueries = require('../db/bot');
const { client } = require('../core/jsonrpc');
const Vzor = require('../core/vzor');
/**
 * @param {object} info - mail info
 * @returns {Promise<void>}
 */
const processedMail = async (info) => {
  let resultMessage;
  try {
    const botTable = await pool.connect(async (connection) => {
      const botTable = await connection.one(
        botQueries.selectByEmail(info.email),
      );
      return botTable;
    });
    const mailMap = await Vzor.search(
      {
        user: botTable.email,
        password: botTable.password,
        markSeen: true, // нужно затем удалять просмотренные письма?
      },
      ['ALL', ['HEADER', 'MESSAGE-ID', info['smtp-id']]],
    );
    // в зависимости от полученной категории разная логика работы с письмом
    if (info.category.includes('transaction')) {
      for (const [_mapId, mail] of mailMap) {
        const { error, result } = await client.request('read', {
          mail,
          secret_key: botTable.secret_key,
        });
        if (error) {
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
