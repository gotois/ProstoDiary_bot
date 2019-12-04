module.exports = async (t) => {
  const {
    createPhotoBuffer,
    deletePlot,
  } = require('../../src/lib/plotly');
  t.true(typeof createPhotoBuffer === 'function');
  t.true(typeof deletePlot === 'function');
  const entryRows = [{ date: '2019-04-20T16:47:44.009Z' }];
  const rangeTimes = [
    '2019-04-15T21:28:04.463Z',
    '2019-04-16T21:00:04.463Z',
    '2019-04-17T21:00:04.463Z',
    '2019-04-18T21:00:04.463Z',
    '2019-04-20T16:47:44.009Z',
  ];
  const photoBuffer = await createPhotoBuffer(entryRows, rangeTimes);
  t.true(Buffer.isBuffer(photoBuffer));
};
