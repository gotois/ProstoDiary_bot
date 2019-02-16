module.exports = t => {
  const {
    getImage,
    getImageBuffer,
    deletePlot,
  } = require('../../src/services/graph.service');
  t.true(typeof getImage === 'function');
  t.true(typeof getImageBuffer === 'function');
  t.true(typeof deletePlot === 'function');
};
