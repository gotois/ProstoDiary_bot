const argv = require('minimist')(process.argv.slice(2));
const prostoDiaryBot = require('../src/index.cjs');

prostoDiaryBot(argv);
