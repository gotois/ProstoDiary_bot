const fs = require('fs');

module.exports = async (t) => {
  t.timeout(4000);
  const voiceService = require('../../src/services/voice.service');
  const buffer = fs.readFileSync('tests/data/voice/voice-example-1.ogg');
  const text = await voiceService.voiceToText(buffer, {
    duration: 1,
    mime_type: 'audio/ogg',
    file_size: 3141,
  });
  t.is(text, 'тестовое сообщение');
};
