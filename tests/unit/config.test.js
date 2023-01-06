const validator = require('validator');
const fs = require('fs');
/**
 * @todo добавить проверку yml файлов конфигурации
 * @param {object} t - test
 */
module.exports = (t) => {
  const eslintrcJSON = fs.readFileSync('.eslintrc').toString();
  t.true(validator.isJSON(eslintrcJSON));
  const prettierrcJSON = fs.readFileSync('.prettierrc').toString();
  t.true(validator.isJSON(prettierrcJSON));
  require('../../.commitlintrc.json');
  require('../../.lintstagedrc.json');
  require('../../package.json');
  t.pass();
};
