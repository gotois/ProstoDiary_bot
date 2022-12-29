#!/usr/bin/env node

// fixme переименовать в server.cjs

require('dotenv').config();
const nodemon = require('nodemon');
const ngrok = require('ngrok');
const logger = require('../src/lib/log');
const { IS_PRODUCTION, SERVER, NGROK } = require('../src/environment');
const clipboardHelper = require('../src/helpers/clipboard');

(async function main() {
  if (IS_PRODUCTION) {
    throw new Error('Please use `node src/app/server`');
  } else {
    let nodemonInstance;
    try {
      const url = await ngrok.connect({
        addr: SERVER.PORT,
        authtoken: NGROK.TOKEN,
        proto: 'http',
        // region: 'eu', // uncomment if needs
        onStatusChange(status) {
          logger.info(status);
        },
        onLogEvent(data) {
          logger.info(data);
        },
      });
      nodemonInstance = nodemon(`-x 'NGROK_URL=${url} node' src/app/server`);
      // const { updateWebhook } = require('../src/lib/sendgrid');
      // await updateWebhook(url);
      clipboardHelper.copy(url);
    } catch {
      logger.error('"Run without NGROK. Telegram webhook doesn\'t work!"');
      nodemonInstance = nodemon({ script: 'src/app/server' });
    }
    nodemonInstance
      .on('start', () => {
        logger.warn('Nodemon has started');
      })
      .on('quit', () => {
        logger.warn('App has quit');
        process.exit(0);
      })
      .on('restart', (files) => {
        if (files) {
          logger.warn('App restarted due to: ' + files);
        }
      });
  }
})();
