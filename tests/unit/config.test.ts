import fs from 'node:fs';
import validator from 'validator';

/**
 * @param {import('ava').ExecutionContext} t - ava test
 */
export default (t) => {
  t.log('testing');
  const prettierrcJSON = fs.readFileSync(new URL('../../.prettierrc', import.meta.url), 'utf8');
  t.true(validator.isJSON(prettierrcJSON));
  t.pass();
};
