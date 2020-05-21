const speech = require('@google-cloud/speech');
const { GOOGLE } = require('../environment');

const client = new speech.SpeechClient({
  credentials: GOOGLE.CREDENTIALS,
});

module.exports = client;
