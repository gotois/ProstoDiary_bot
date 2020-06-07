const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const { pool } = require('../db/sql');
const passportQueries = require('../db/selectors/passport');
const bullService = require('../services/bull.service');
const imapService = require('../services/imap.service');
const apiRequest = require('../lib/api').private;
const { SERVER } = require('../environment');
/**
 * выявлять неактивных пользователей telegram
 */
const checkUsers = () => {
  require('../include/telegram-bot/job/check-users');
};
// eslint-disable-next-line no-unused-vars
const checkMails = (botTable) => {
  // fixme неверно считать через jwt активацию, узнать что бот неактивирован можно только постфактум
  if (!botTable.activated) {
    throw new Error('bot not activated');
  }
  // eslint-disable-next-line no-unused-vars
  const imap = imapService(
    {
      host: 'imap.yandex.ru',
      port: 993,
      user: botTable.email,
      password: botTable.password,
    },
    botTable.secret_key,
  );
  // находим письма за сегодняшний день
  // считываем их содержимое и записываем в БД
  // eslint-disable-next-line no-unused-vars
  const today = format(
    fromUnixTime(Math.round(new Date().getTime() / 1000)),
    'MMM dd, yyyy',
  );
  // const emails = await imap.search(['ALL', ['SINCE', today]]);
  // todo сохранять необработанные письма в Story
  // ...
};

const crawLatestMessages = async (options) => {
  const { url, auth } = options.data;

  // sniff main document
  const sniffDocument = await apiRequest({
    jsonrpc: '2.0',
    id: 'xxxxx',
    method: 'ld-sniff',
    params: {
      url,
      auth,
    },
  });

  // recursive load url (limit 10 pages)
  for (const document of sniffDocument.values()) {
    // todo переделать код в очередь сообщений
    for (const url of document.urls) {
      // sniff child document
      const sniffDocument = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'ld-sniff',
        params: {
          url,
          auth,
        },
      });
      for (const document of sniffDocument.values()) {
        // upload documents to JENA
        if (document.jsonld['@type'].endsWith('Action')) {
          await apiRequest({
            jsonrpc: '2.0',
            id: 'xxxxx',
            method: 'ld-upload',
            params: {
              document: document.jsonld,
            },
          });
        }
      }
    }
  }
};

// список всех CRON задач
module.exports = async () => {
  const checkUserMQ = bullService('CHECK USERS', checkUsers, true);
  // const mailUserMQ = bullService('CHECK MAILS', checkMails, true); // todo добавить проверку писем
  const crawLatestMessagesMQ = bullService(
    'CRAW LATEST MESSAGES',
    crawLatestMessages,
    true,
  );

  const allBots = await pool.connect(async (connection) => {
    const clientBots = await connection.many(passportQueries.selectAllBot());
    return clientBots;
  });

  allBots.forEach((clientBot) => {
    checkUserMQ.queue.add(
      'CHECK ACTIVE TELEGRAM USERS',
      {},
      {
        repeat: {
          cron: '0 0 1 * * ?', // Every day at 1am
        },
      },
    );

    crawLatestMessagesMQ.queue.add(
      'UPLOAD LATEST MESSAGES',
      {
        url: `${SERVER.HOST}/message/${clientBot.email}/latest`,
        auth: {
          user: clientBot.email,
          password: clientBot.email_password,
          sendImmediately: false,
        },
      },
      {
        repeat: {
          cron: '0 0 1 * * ?', // Every day at 1am
        },
      },
    );
  });
};
