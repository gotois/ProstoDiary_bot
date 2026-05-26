import fs from 'node:fs';
import { createRequire } from 'node:module';
import validator from 'validator';
import yaml from 'js-yaml';

const require = createRequire(import.meta.url);

/**
 * @param {import('ava').ExecutionContext} t - ava test
 */
export default (t) => {
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
