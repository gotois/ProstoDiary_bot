// @deprecated
// вместо этого используется core
module.exports = (t) => {
  const { mailExample } = require('../fixtures/database/mail');
  const messageIdString =
    '<xxxxxxxxxxxxx_5XtptB-A@ismtpd0001p1lon1.sendgrid.net>';

  const messageId = messageIdString.replace(
    'xxxxxxxxxxxxx',
    String(Math.random()).slice(3, 3 + 13),
  );

  mailExample.headers['message-id'] = messageId;
  mailExample['smtp-id'] = messageId;
  mailExample['messageId'] = messageId;

  const telegramMessageId = Number(String(Math.random()).slice(3, 3 + 5));
  mailExample['telegram_message_id'] = telegramMessageId;

  // fixme использовать storyLogger
  // const story = new Story(mailExample);
  // const result = await story.commit();
  // t.log(result);
  t.pass();
};
