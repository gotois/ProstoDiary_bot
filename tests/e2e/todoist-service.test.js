module.exports = async (t) => {
  const todoist = require('../../src/lib/todoist');
  const result = await todoist.sync();
  t.log(result);

  // result.user.email => "my@mail.com"
  // result.user.karma => 100
  // result.projects[0].name => "Inbox"
  // result.projects[0].id => 159219528
  // result.items[0].date_added => "Thu 12 Oct 2015 10:58:00 +0000"
  // result.items[0].date_lang => "en"
  // result.items[0].content => "сделать нужно это"
  // result.items[0].id => 83830579
  // result.items[0].project_id => 159219528
  // result.items[0].due_date_utc => "Mon 01 Jul 2017 23:59:59 +0000"
};
