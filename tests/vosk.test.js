const test = require('ava');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

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

test('Vosk - Status HTTP correct', async (t) => {
  const response = await fetch(`${VOSK_URL}/recognize`, {
    method: 'POST',
    body: makeFormData(),
  });
  t.is(response.status, 200);
  const result = await response.json();
  t.not(result, null, 'Ответ не является JSON');
  t.true(Object.hasOwn(result, 'text'), `Поле 'text' отсутствует в ответе: ${JSON.stringify(result)}`);
});

test('Vosk - Recognize text', async (t) => {
  const response = await fetch(`${VOSK_URL}/recognize`, {
    method: 'POST',
    body: makeFormData(),
  });
  const result = await response.json();
  t.is(typeof result.text, 'string');
  t.true(
    result.text.trim().length > 0,
    `Модель не распознала речь в test-ru.wav. Полный ответ: ${JSON.stringify(result)}`,
  );
});

test('Vosk - No audio', async (t) => {
  const response = await fetch(`${VOSK_URL}/recognize`, {
    method: 'POST',
  });
  t.is(response.status, 400);
  const result = await response.json();
  t.not(result, null);
  t.true(Object.hasOwn(result, 'error'), `Поле 'error' отсутствует в ответе: ${JSON.stringify(result)}`);
});
