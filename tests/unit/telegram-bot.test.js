module.exports = async (t) => {
  await t.throws(() => {
    require('../../src/bot');
  });
};
