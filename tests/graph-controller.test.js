module.exports = t => {
  const {
    formatWord,
    createRegExp,
    isRegexString,
    createRegexInput,
  } = require('../src/services/input.service');
  // formatWord
  {
    t.true(typeof formatWord('lksdjf') === 'string');
    t.is(formatWord('/'), '\\/');
    t.is(formatWord('|'), '\\|');
  }
  // createRegExp
  {
    t.true(createRegExp('something') instanceof RegExp);
    t.true(createRegexInput('читал').test('Работал читал \nБухал'));
    t.true(createRegexInput('Работал').test('Работал читал \nБухал'));
    t.true(createRegexInput('бухал').test('Работал читал \nБухал'));
  }
  // isRegexString
  {
    t.true(isRegexString('/something/'));
    t.false(isRegexString('/something'));
    t.false(isRegexString('something/'));
  }
};
