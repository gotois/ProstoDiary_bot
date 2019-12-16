module.exports = (t) => {
  const {
    replaceBetween,
    isRegexString,
    createRegexInput,
    formatWord,
  } = require('../../src/services/text.service');
  // replaceBetween
  t.is(replaceBetween('some 111 text', 5, 8, 'hi'), 'some hi text');

  // formatWord
  t.true(typeof formatWord('lksdjf') === 'string');
  t.is(formatWord('/'), '\\/');
  t.is(formatWord('|'), '\\|');

  // createRegexInput
  // TODO: перенести в createRegexInput
  // t.true(createRegExp('something') instanceof RegExp);

  t.true(createRegexInput('Треня').test('треня'));
  t.true(createRegexInput('Трен').test('трен'));
  t.true(createRegexInput('читал').test('Работал читал \nБухал'));
  t.true(createRegexInput('Работал').test('Работал читал \nБухал'));
  t.true(createRegexInput('бухал').test('Работал читал \nБухал'));
  t.true(createRegexInput('/ТРен/'.toLowerCase()).test('треня'));

  // isRegexString
  t.true(isRegexString('/something/gi'));
  t.true(isRegexString('/somethinG/g'));
  t.false(isRegexString('/SomethinG/G'));
  t.false(isRegexString('/SomethinG/G'));
  t.false(isRegexString('/123/232/333/444'));
  t.false(isRegexString(''));
  t.false(isRegexString('/something'));
  t.false(isRegexString('something/'));
};
