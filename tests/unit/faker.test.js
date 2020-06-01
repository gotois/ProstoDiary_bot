module.exports = (t) => {
  const fakerService = require('../../src/services/faker.service');
  t.is(typeof fakerService.FakerPassport.passport, 'string');
};
