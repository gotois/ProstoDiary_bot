const express = require('express');
const argv = require('minimist')(process.argv.slice(2));
const prostoDiaryBot = require('../src/index.cjs');

const app = express();
const port = 3000;
let prostoDiary = null;

app.listen(port, () => {
  console.log('Telegram Server is listening 🚀');
});

if (!process.env.NODE_ENV.toUpperCase().startsWith('DEV')) {
  prostoDiary = prostoDiaryBot({
    ...argv,
  });
  app.use(prostoDiary.middleware);
} else {
  const ngrok = require('ngrok');
  ngrok
    .connect({
      proto: 'http',
      addr: port,
    })
    .then((url) => {
      console.log(url);
      prostoDiary = prostoDiaryBot({
        ...argv,
        domain: url,
      });
      app.use(prostoDiary.middleware);
    })
    .catch((error) => {
      console.error(error);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    });
}
