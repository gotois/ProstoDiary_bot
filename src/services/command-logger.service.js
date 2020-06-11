const winston = require('winston');
const CommandTransport = require('../db/adapters/command-transport');
const { post } = require('../lib/request');
/**
 * @param {Array<object>} mainEntity - main entity
 * @returns {boolean}
 */
const isSilent = (mainEntity) => {
  const silentValue = mainEntity.find((entity) => {
    return entity.name === 'silent';
  });
  return silentValue && silentValue['value'];
};
const commandTransport = new CommandTransport();
// уведомляем что данные обрабатываются в очереди
commandTransport.on('pre-logged', async (authorizeAction, auth) => {
  // зависимости от silent свойства либо уведомляем либо нет
  if (isSilent(authorizeAction.mainEntity)) {
    // logger.info('skip notify pre-logged');
    return;
  }
  await post(
    `${authorizeAction.agent.url}/hooks/command-processing`,
    authorizeAction,
    {
      'User-Agent': 'Bot-Hookshot',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Bot-Delivery': authorizeAction.identifier,
      'X-Bot-Assistant': authorizeAction.agent.email,
    },
    undefined,
    auth,
  );
});
// уведомляем вебхукой что данные обработаны
commandTransport.on('logged', async (acceptAction, auth) => {
  // зависимости от silent свойства либо уведомляем либо нет
  if (isSilent(acceptAction.mainEntity)) {
    // logger.info('skip notify logged');
    return;
  }
  await post(
    `${acceptAction.agent.url}/hooks/command-inserted`,
    acceptAction,
    {
      'User-Agent': 'Bot-Hookshot',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Bot-Delivery': acceptAction.identifier,
      'X-Bot-Assistant': acceptAction.agent.email,
    },
    undefined,
    auth,
  );
});

const storyLogger = winston.createLogger({
  transports: [commandTransport],
});
// уведомляем вебхукой что данные не сохранены
storyLogger.on('error', async (rejectAction, auth) => {
  if (isSilent(rejectAction.mainEntity)) {
    // logger.info('skip notify logged');
    return;
  }
  const headers = {
    'User-Agent': 'Bot-Hookshot',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Bot-Delivery': rejectAction.identifier,
    'X-Bot-Assistant': rejectAction.agent.email,
  };
  await post(
    `${rejectAction.agent.url}/hooks/command-error`,
    rejectAction,
    headers,
    undefined,
    auth,
  );
});

module.exports = storyLogger;
