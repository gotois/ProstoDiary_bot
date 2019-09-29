const validator = require('validator');
const fs = require('fs');
/**
 * @todo добавить проверку yml файлов конфигурации
 */
module.exports = (t) => {
  const eslintrcJSON = fs.readFileSync('.eslintrc').toString();
  t.true(validator.isJSON(eslintrcJSON));
  const prettierrcJSON = fs.readFileSync('.prettierrc').toString();
  t.true(validator.isJSON(prettierrcJSON));
  require('../../.commitlintrc.json');
  require('../../.lintstagedrc.json');
  require('../../app.json');
  require('../../package.json');
  require('../../nodemon.json');
  t.pass();
};