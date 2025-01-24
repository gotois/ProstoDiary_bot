const nodemon = require('nodemon');
const ngrok = require('@ngrok/ngrok');
const argv = require('minimist')(process.argv.slice(2));

ngrok
  .forward({
    addr: argv.port,
    proto: 'http',
    authtoken_from_env: true,
  })
  .then((listener) => {
    const url = listener.url();
    console.log(`Ingress established at: ${url}`);
    nodemon(`-x 'TELEGRAM_DOMAIN=${url} node' ./src/index.cjs --port ${argv.port}`);
  })
  .catch((error) => {
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
