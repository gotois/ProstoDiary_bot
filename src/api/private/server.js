const jayson = require('jayson/promise');

// Приватный API, который доступен только основному серверу
module.exports = jayson.server({
  'ping': require('./v1/ping'),

  // assistants
  'assistant-creates': require('./v1/assistant-creates'),
  'assistant-many': require('./v1/assistant-many'),
  'assistant-one': require('./v1/assistant-one'),

  // user
  'user-passport': require('./v1/user-passport'),

  // thing
  'thing-get': require('./v1/thing-get'),

  // bot activation
  'bot-sign-in': require('./v1/bot-sign-in'),
  'bot-sign-out': require('./v1/bot-sign-out'),

  // get messages
  'get-date-message': require('./v1/get-date-message'),
  'get-latest-message': require('./v1/get-latest-message'),
  'get-raw-message': require('./v1/get-raw-message'),
  'get-revision-message': require('./v1/get-revision-message'),
});
