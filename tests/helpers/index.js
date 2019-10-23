const test = require('ava');
// Simple Heroku Detect
if (!process.env.PORT || process.env.NODE_ENV !== 'TRAVIS_CI') {
  require('dotenv').config();
}
const { IS_CI, IS_FAST_TEST } = require('../../src/environment');
// TRAVIS удалить, когда перенесу все необходимые env на Travis
const skipTestForFastOrTravis = IS_FAST_TEST || IS_CI ? test.skip : test;
const skipTestForFast = IS_FAST_TEST ? test.skip : test;

module.exports = {
  test,
  skipTestForFastOrTravis,
  skipTestForFast,
};
