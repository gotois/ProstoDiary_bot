const jayson = require('jayson/promise');

// Приватный API, который доступен только основному серверу
module.exports = jayson.server({
  'ping': require('./v1/ping'),

  // authorization
  'authorization': require('./v1/authorization'),

  // story
  'story-create': require('./v1/story-create'),

  // assistants
  'assistant-many': require('./v1/assistant-many'),
  'assistant-one': require('./v1/assistant-one'),
  'assistant-one-by-email': require('./v1/assistant-one-by-email'),
  'assistant-create-new': require('./v1/assistant-create-new'),

  // oauth
  'oauth-create-passport': require('./v1/oauth-create-passport'),
  'oauth-update': require('./v1/oauth-update'),

  // ld jena
  'ld-query': require('./v1/ld-query'),
  'ld-sniff': require('./v1/ld-sniff'),
  'ld-upload': require('./v1/ld-upload'),

  // user
  'user-passport': require('./v1/user-passport'),
  'user-get-phone': require('./v1/user-get-phone'),

  // thing
  'thing-get': require('./v1/thing-get'),

  // bot
  'bot-sign-in': require('./v1/bot-sign-in'),
  'bot-sign-out': require('./v1/bot-sign-out'),
  'bot-get-passport': require('./v1/bot-get-passport'),

  // get messages
  'get-date-message': require('./v1/get-date-message'),
  'get-latest-message': require('./v1/get-latest-message'),
  'get-raw-message': require('./v1/get-raw-message'),
  'get-revision-message': require('./v1/get-revision-message'),
});
