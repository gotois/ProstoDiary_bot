const activitystreams = require('telegram-bot-activitystreams');

// получение файла
async function getPhoto(url) {
    const res = await fetch(url);
    if (res.status !== 200) {
      throw await Promise.reject("Status was not 200");
    }
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer)
}

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('activity', activity);

  // todo - посылать на Vzor, чтобы он расшифровал
  const photo = await getPhoto(activity.object[0].url);

  //   bot.sendPhoto(
  //       message.chat.id,
  //       photo,
  //       {
  //         caption: 'kek',
  //       },
  //       {
  //         filename: 'kek',
  //         contentType: 'image/png',
  //       },
  //     );
};
