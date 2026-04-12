import assert from 'node:assert';
import { test, describe } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VOSK_HOST = process.env.VOSK_HOST || 'localhost';
const VOSK_PORT = process.env.VOSK_PORT || 2700;
const VOSK_URL = `http://${VOSK_HOST}:${VOSK_PORT}`;

const WAV_PATH = resolve(__dirname, '../../../vosk/test-ru.wav');

function makeFormData() {
  const buffer = readFileSync(WAV_PATH);
  const blob = new Blob([buffer], {
    type: 'audio/wav',
  });
  const form = new FormData();
  form.append('audio', blob, 'test-ru.wav');
  return form;
}

describe('Vosk', () => {
  describe('POST /recognize', () => {
    test('Status HTTP correct', async () => {
      const response = await fetch(`${VOSK_URL}/recognize`, {
        method: 'POST',
        body: makeFormData(),
      });
      assert.strictEqual(response.status, 200);
      const result = await response.json();
      assert.ok(result !== null, 'Ответ не является JSON');
      assert.ok(Object.hasOwn(result, 'text'), `Поле 'text' отсутствует в ответе: ${JSON.stringify(result)}`);
    });

    test('Recognize text', async () => {
      const response = await fetch(`${VOSK_URL}/recognize`, {
        method: 'POST',
        body: makeFormData(),
      });
      const result = await response.json();
      assert.strictEqual(typeof result.text, 'string');
      assert.ok(
        result.text.trim().length > 0,
        `Модель не распознала речь в test-ru.wav. Полный ответ: ${JSON.stringify(result)}`,
      );
    });

    test('No audio', async () => {
      const response = await fetch(`${VOSK_URL}/recognize`, {
        method: 'POST',
      });
      assert.strictEqual(response.status, 400);
      const result = await response.json();
      assert.ok(result !== null);
      assert.ok(Object.hasOwn(result, 'error'), `Поле 'error' отсутствует в ответе: ${JSON.stringify(result)}`);
    });
  });
});
