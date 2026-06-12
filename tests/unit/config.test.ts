import fs from 'node:fs';
import validator from 'validator';
import yaml from 'js-yaml';

/**
 * @param {import('ava').ExecutionContext} t - ava test
 */
export default (t) => {
  t.log('testing');
  const configYML = fs.readFileSync(new URL('../../../compose.yml', import.meta.url), 'utf8');
  t.notThrows(() => {
    const config = yaml.load(configYML);
    t.true(validator.isJSON(JSON.stringify(config)));
  });
  const prettierrcJSON = fs.readFileSync(new URL('../../.prettierrc', import.meta.url), 'utf8');
  t.true(validator.isJSON(prettierrcJSON));
  t.pass();
};
