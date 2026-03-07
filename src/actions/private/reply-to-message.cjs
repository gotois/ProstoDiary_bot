const { TYPING, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const { updateUserLocation } = require('../../models/users.cjs');

module.exports = async (bot, message) => {
  console.log('reply to message', message);

  if (!message.user.location) {
    await updateUserLocation(message.chat.id, {
      latitude: city.lat,
      longitude: city.lng,
    });
  }

  await sendPrepareAction(bot, message.chat.id, TYPING);
};
