const { pool } = require('../db/sql');
const passportQueries = require('../db/selectors/passport');
const bullService = require('../services/bull.service');
const apiRequest = require('../lib/api').private;
const { SERVER } = require('../environment');
/**
 * выявлять неактивных пользователей telegram
 */
const checkUsers = async () => {
   try {
    // пингуем тем самым проверяем что пользователь активен
    await bot.sendChatAction(passport.telegram_id, 'typing');
  } catch (error) {
    console.error(error.stack);
    switch (error.response && error.response.statusCode) {
      case 403: {
        // fixme отправлять oidc на деактивацию
        // await connection.query(
        //   passportQueries.deactivateByPassportId(passport.id),
        // );
        break;
      }
      default: {
        break;
      }
    }
  }
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
// todo вынести функционал в ассистенты, а здесь только посылать вебхуки
module.exports = async () => {
  const checkUserMQ = bullService('CHECK USERS', checkUsers, true);
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
