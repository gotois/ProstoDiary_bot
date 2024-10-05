const express = require('express');
const ngrok = require('../../landing-page/web/node_modules/ngrok/index.js');

const argv = require('minimist')(process.argv.slice(2));
const prostoDiaryBot = require('../src/index.cjs');

const app = express();
const port = 3000

app.listen(port, () => {
  console.log(`Express server is listening`);
});

if (true) {
  app.use(prostoDiaryBot({
        ...argv,
        // domain: url,
      }).middleware
    )
} else {
  ngrok.connect({
    proto: "http",
    addr: port,
  }).then((url) => {
    console.log(url)
    app.use(prostoDiaryBot({
        ...argv,
        domain: url,
      }).middleware
    )
  }).catch(error => {
    console.error(error);
  });
}

