const activitystreams = require('telegram-bot-activitystreams');

const OFFER = `
Лицензионное соглашение
=======================

Данное ПО поставляется как есть.
Любой вред нанесенный данным ПО никак не контролируется.
Пользуйтесь им на свой страх и риск.
`.trim();

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  await bot.sendMessage(activity.target.id, OFFER, {
    parse_mode: 'markdown',
  });
};
