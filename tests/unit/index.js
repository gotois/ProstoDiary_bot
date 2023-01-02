const {
  test,
  skipTestForFast,
} = require('../helpers');

test('database config', require('./dbconfig.test'));
test('helpers', require('./helpers.test'));
test('jsonld', require('./jsonld.test'));
test('logger', require('./log.test'));
test('crypto', require('./crypto.test'));
test('commands', require('./commands.test'));
test('datetime', require('./date.test'));
test('format', require('./format.test'));
test('env', require('./environment.test'));
test('faker', require('./faker.test'));
test('request', require('./request.test'));
skipTestForFast('config', require('./config.test'));
