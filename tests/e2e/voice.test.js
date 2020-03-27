const fs = require('fs');
const { v1: uuidv1 } = require('uuid');
const request = require('supertest');

module.exports = async (t) => {
  t.timeout(10000);
  const voiceAction = require('../../src/core/functions/voice');
  const buffer = fs.readFileSync('tests/data/voice/voice-example-1.ogg');
  const result = await voiceAction({
    buffer: buffer,
    silent: false,
    date: Math.round(new Date().getTime() / 1000),
    mimeType: 'audio/ogg',
    fileSize: 3141,
    duration: 1,
    uid: uuidv1(),
  });
  const res = await request(t.context.app)
    .post('/api')
    .send({
      method: 'POST',
      url: '/api',
      headers: {
        'User-Agent': `Ava Supertest`,
        'Content-Type': 'application/json',
        'Accept': 'application/schema+json',
      },
      body: {
        jsonrpc: '2.0',
        method: 'insert',
        id: 1,
        params: result.context,
      },
    });
  t.is(res.status, 200);
  if (typeof res.body.result !== 'object') {
    t.fail('Invalid JSON-LD body');
  }
};
