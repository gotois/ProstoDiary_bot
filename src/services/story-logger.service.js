const winston = require('winston');
const StoryTransport = require('../db/adapters/story-transport');
const { post } = require('../lib/request');

const storyTransport = new StoryTransport();
/**
 * @todo копипаста из command-logger.service.js
 * @param {Array<object>} mainEntity - main entity
 * @returns {boolean}
 */
const isSilent = (mainEntity) => {
  const silentValue = mainEntity.find((entity) => {
    return entity.name === 'silent';
  });
  return silentValue && silentValue['value'];
};

// уведомляем что данные обрабатываются в очереди
storyTransport.on('pre-logged', async (authorizeAction, auth) => {
  // зависимости от silent свойства либо уведомляем либо нет
  if (isSilent(authorizeAction.mainEntity)) {
    // logger.info('skip notify pre-logged');
    return;
  }
  await post(
    `${authorizeAction.agent.url}/hooks/message-processing`,
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
// уведомляем вебхукой что данные сохранены
storyTransport.on('logged', async (acceptAction, auth) => {
  // зависимости от silent свойства либо уведомляем либо нет
  if (isSilent(acceptAction.mainEntity)) {
    // logger.info('skip notify logged');
    return;
  }
  await post(
    `${acceptAction.agent.url}/hooks/message-inserted`,
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
  transports: [storyTransport],
});
// уведомляем вебхукой что данные не сохранены
storyLogger.on('error', async (rejectAction, auth) => {
  if (isSilent(rejectAction.mainEntity)) {
    // logger.info('skip notify logged');
    return;
  }
  await post(
    `${rejectAction.agent.url}/hooks/message-error`,
    rejectAction,
    {
      'User-Agent': 'Bot-Hookshot',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Bot-Delivery': rejectAction.identifier,
      'X-Bot-Assistant': rejectAction.agent.email,
    },
    undefined,
    auth,
  );
});

module.exports = storyLogger;
