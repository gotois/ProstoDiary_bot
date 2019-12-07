module.exports = async (t) => {
  const Story = require('../../src/models/story');

  const story = new Story({
    subject: 'BuyIntent',
    uid: -1,
  });
  story.append('buy an Apple in Moscow', 'plain/text');
  const result = await story.commit();
  t.log(result);
};
