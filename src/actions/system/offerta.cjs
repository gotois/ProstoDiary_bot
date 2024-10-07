function getOfferText() {
  return `
Лицензионное соглашение
=======================

Данное ПО поставляется как есть.
Любой вред нанесенный данным ПО никак не контролируется.
Пользуйтесь им на свой страх и риск.
  `.trim();
}

module.exports = async (bot, message) => {
  await bot.sendMessage(message.chat.id, getOfferText(), {
    parse_mode: 'MarkdownV2',
  });
};
