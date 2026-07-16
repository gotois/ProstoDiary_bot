import fs from 'node:fs';
import test, { type ExecutionContext } from 'ava';
import validator from 'validator';

test('config', (t: ExecutionContext) => {
  t.log('testing');
  const prettierrcJSON = fs.readFileSync(new URL('../../.prettierrc', import.meta.url), 'utf8');
  t.deepEqual(validator.isJSON(prettierrcJSON), true);
});
