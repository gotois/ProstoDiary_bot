// @deprecated
// вместо этого используется core
module.exports = async (t) => {
  const Story = require('../../src/models/story');
  const { mailExample } = require('../data/database/mail');

  const messageId = '<xxxxxxxxxxxxx_5XtptB-A@ismtpd0001p1lon1.sendgrid.net>'.replace(
    'xxxxxxxxxxxxx',
    String(Math.random()).slice(3, 3 + 13),
  );

  mailExample.headers['message-id'] = messageId;
  mailExample['smtp-id'] = messageId;
  mailExample['messageId'] = messageId;

  const telegramMessageId = Number(String(Math.random()).slice(3, 3 + 5));
  mailExample['telegram_message_id'] = telegramMessageId;

  const story = new Story(mailExample);
  const result = await story.commit();

  t.log(result);
};
