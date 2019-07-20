const test = require('ava');
// Simple Heroku Detect
if (!process.env.PORT || process.env.NODE_ENV !== 'TRAVIS_CI') {
  require('dotenv').config();
}
const { IS_CI } = require('../../src/env');
// TODO: https://github.com/gotois/ProstoDiary_bot/issues/106
// TRAVIS удалить, когда перенесу все необходимые env на Travis
const IS_FAST_TEST = Boolean(process.env.FAST_TEST);
const skipTestForFastOrTravis = IS_FAST_TEST || IS_CI ? test.skip : test;
const skipTestForFast = IS_FAST_TEST ? test.skip : test;

module.exports = {
  test,
  skipTestForFastOrTravis,
  skipTestForFast,
};
