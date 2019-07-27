const { test, skipTestForFastOrTravis } = require('../helpers');

test('database config', require('./dbconfig.test'));
test('logger', require('./log.test'));
test('crypto', require('./crypto.test'));
test('commands', require('./commands.test'));
test('datetime', require('./datetime.test'));
test('session', require('./session.test'));
test('money', require('./money.test'));
test('format', require('./format.test'));
test('text service', require('./text-service.test'));
test('detect lang', require('./detect-lang.test'));
test('env', require('./environment.test'));
test('faker', require('./faker.test'));
skipTestForFastOrTravis('QR test', require('./qr.test'));
test('request', require('./request.test'));
