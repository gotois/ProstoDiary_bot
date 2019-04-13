import test from 'ava';

// TODO: переделать под cross-env
process.env.SALT_PASSWORD = '123456';
process.env.NODE_ENV = 'production';
process.env.TOKEN = '123456';

test('database config', require('./dbconfig.test'));
test('logger', require('./log.test'));
test('crypto', require('./crypto.test'));
test('commands', require('./commands.test'));
test('datetime', require('./datetime.test'));
test('session', require('./session.test'));
test('money', require('./money.test'));
test('graph service', require('./graph-service.test'));
test('graph controller', require('./graph-controller.test'));
test('format', require('./format.test'));
test('text service', require('./text-service.test'));
test('speller service', require('./speller-service.test'));
test('detect lang', require('./detect-lang.test'));
test('env', require('./env.test'));
test('bot init', require('./telegram-bot.test'));
