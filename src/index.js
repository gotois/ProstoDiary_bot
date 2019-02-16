const client = require('./database/database.client');
const logger = require('./services/logger.service');
const {IS_PRODUCTION} = require('./env');

// Start Web server
(async function web() {
  // TODO: лучше сделать прокидывание env
  if (!IS_PRODUCTION) {
    return;
  }
  const http = require('http');
  const url = require('url');
  const path = require('path');
  const fs = require('fs');
  const WEB_PORT = Number(process.env.PORT) || 9000;
  http.createServer((req, res) => {
    const uri = url.parse(req.url).pathname;
    let filename = path.join(process.cwd(), uri);
    fs.exists(filename, (exists) => {
      if (!exists) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
      }
      if (fs.statSync(filename).isDirectory()) {
        filename = path.join(filename, 'www/index.html');
      }
      fs.readFile(filename, 'binary', (error, file) => {
        if (error) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.write('Oops 🤷️');
          logger.log('error', error.toString());
          res.end();
          return;
        }
        res.writeHead(200);
        res.write(file, 'binary');
        res.end();
      });
    });
  }).listen(WEB_PORT);
  logger.log('info', 'Web server started');
})();

// start Telegram Bot
(async function telegramBot() {
  /**
   * @returns {Promise<any>}
   */
  const checkAuth = () => new Promise(async (resolve, reject) => {
    // noinspection MagicNumberJS
    const DELAY = IS_PRODUCTION ? 10000 : 2500;
    const timer = setTimeout(() => reject(new Error('Network unavailable')), DELAY);
    try {
      const me = await require('./config').getMe();
      clearTimeout(timer);
      resolve(me);
    } catch (error) {
      logger.log('info', error);
    }
  });
  try {
    if (!client._connected) {
      await client.connect();
    }
    await checkAuth();
    await require('./events');
    logger.log('info', 'bot started');
  } catch (error) {
    logger.log({level: 'error', message: error.toString()});
    setTimeout(async () => {
      logger.log({level: 'info', message: 'try reconnecting…'});
      await telegramBot();
    }, IS_PRODUCTION ? 10000 : 500);
  }
})();
