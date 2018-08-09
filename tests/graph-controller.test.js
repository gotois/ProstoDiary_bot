module.exports = t => {
  const {
    formatWord,
    createRegExp,
    isRegexString,
    createRegexInput,
    convertStringToRegexp,
  } = require('../src/services/input.service');
  // formatWord
  {
    t.true(typeof formatWord('lksdjf') === 'string');
    t.is(formatWord('/'), '\\/');
    t.is(formatWord('|'), '\\|');
  }
  {
    t.true(convertStringToRegexp('/ТРен/'.toLowerCase()).test('треня'));
  }
  // createRegExp
  {
    t.true(createRegExp('something') instanceof RegExp);
  }
  // createRegexInput
  {
    t.true(createRegexInput('Треня').test('треня'));
    t.true(createRegexInput('Трен').test('трен'));
    t.true(createRegexInput('читал').test('Работал читал \nБухал'));
    t.true(createRegexInput('Работал').test('Работал читал \nБухал'));
    t.true(createRegexInput('бухал').test('Работал читал \nБухал'));
  }
  // isRegexString
  {
    t.true(isRegexString('/something/gi'));
    t.true(isRegexString('/somethinG/g'));
    t.false(isRegexString('/SomethinG/G'));
    t.false(isRegexString('/SomethinG/G'));
    t.false(isRegexString('/123/232/333/444'));
    t.false(isRegexString(''));
    t.false(isRegexString('/something'));
    t.false(isRegexString('something/'));
  }
};
