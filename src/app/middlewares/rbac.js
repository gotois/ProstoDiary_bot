const AccessControl = require('accesscontrol');

const ac = new AccessControl();
ac.grant('bot').readOwn('message', ['*']);
ac.grant('bot').readAny('message', [
  '*',
  '!object',
  '!subjectOf',
  '!sameAs',
  '!agent',
  '!startTime',
  '!endTime',
  '!image.url',
]);
ac.grant('user').extend('bot');

module.exports = ac;
