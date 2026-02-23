const { TYPING, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const { updateUserLocation } = require('../../models/users.cjs');

module.exports = async (bot, message) => {
  console.log('reply to message', message);

  const [user] = getUsers(message.chat.id);
  if (!user.location) {
    const cityName = message.text.toLowerCase();
    const city = cities.find((city) => {
      return city.name.toLowerCase() === cityName;
    });

    if (city) {
      const timezone = tzlookup(city.lat, city.lng);
      await updateUserLocation(message.chat.id, {
        timezone,
        latitude: city.lat,
        longitude: city.lng,
      });
      const data = `Ваша таймзона: ${timezone}.\nДля завершения регистрации требуется подтвердить свой номер телефона`;
      await bot.sendMessage(message.chat.id, data, {
        reply_markup: {
          remove_keyboard: true,
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            [
              {
                // request_contact может работать только в таком виде
                text: '📞 Отправить контакт',
                request_contact: true,
              },
            ],
          ],
        },
      });
    } else {
      await bot.sendMessage(message.chat.id, `Город ${cityName} не найден. Повторите попытку`);
    }
  }

  await sendPrepareAction(bot, message, TYPING);
};
