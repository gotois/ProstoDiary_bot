module.exports = (t) => {
  const fakerService = require('../../src/services/faker.service');
  const fakeDevice = new fakerService.Device();
  t.is(typeof fakeDevice.DEVICE_ID, 'string');
  t.is(typeof fakeDevice.DEVICE_OS, 'string');
};
