const express = require('express');
const argv = require('minimist')(process.argv.slice(2));
const prostoDiaryBot = require('../src/index.cjs');

const app = express();
const port = 3000;

if (process.env.NODE_ENV !== 'DEV') {
  app.listen(port, () => {
    console.log('Telegram Dev server is listening');
  });
  app.use(
    prostoDiaryBot({
      ...argv,
    }).middleware,
  );
} else {
  const ngrok = require('ngrok');
  ngrok
    .connect({
      proto: 'http',
      addr: port,
    })
    .then((url) => {
      console.log(url);
      app.use(
        prostoDiaryBot({
          ...argv,
          domain: url,
        }).middleware,
      );
    })
    .catch((error) => {
      console.error(error);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    });
}
