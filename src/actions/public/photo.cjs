const activitystreams = require('telegram-bot-activitystreams');

module.exports = (bot, message) => {
  const activity = activitystreams(message);
  console.log('activity', activity);

  // получение файла телеграма
  //   const res = await fetch(message.photo[0].file.url);
  //   if (res.status !== 200) {
  //     throw await Promise.reject("Status was not 200");
  //   }
  //   const buffer = await res.arrayBuffer();
  //
  //   bot.sendPhoto(
  //       message.chat.id,
  //       Buffer.from(buffer),
  //       {
  //         caption: 'kek',
  //       },
  //       {
  //         filename: 'kek',
  //         contentType: 'image/png',
  //       },
  //     );
};
