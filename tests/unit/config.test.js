const fs = require('node:fs');
const validator = require('validator');
const yaml = require('js-yaml');
// eslint-disable-next-line ava/use-test
const { ExecutionContext } = require('ava');
/**
 * @param {ExecutionContext} t - ava test
 */
module.exports = (t) => {
  t.log('testing');
  const configYML = fs.readFileSync('compose.yml', 'utf8');
  t.notThrows(() => {
    const config = yaml.load(configYML);
    t.true(validator.isJSON(JSON.stringify(config)));
  });
  const eslintrcJSON = fs.readFileSync('.eslintrc').toString();
  t.true(validator.isJSON(eslintrcJSON));
  const prettierrcJSON = fs.readFileSync('.prettierrc').toString();
  t.true(validator.isJSON(prettierrcJSON));
  require('../../.commitlintrc.json');
  require('../../.lintstagedrc.json');
  require('../../package.json');
  t.pass();
};
