const { bot } = require('./bot.cjs');
const {
  getUserByActorId,
} = require('../models/users.cjs');

module.exports = async (request, response) => {
  const activity = request.body?.credentialSubject;
  if (!activity) {
    return response.status(400).send('Validation Body Failed');
  }

  switch (activity.type) {
    case 'Announce': {

      // todo - нужно открывать в Mini App (web_app) с передачей ссылки object
      const keyboardOpen = {
        text: 'Посмотреть',
        url: activity.object,
      };
      const keyboardLater = {
        text: 'Напомнить позже',
        callback_data: 'notify_calendar--later',
      };
      const keyboardLater60 = {
        text: 'Напомнить через 1 час',
        callback_data: 'notify_calendar--60',
      };
      const keyboardLaterTomorrow = {
        text: 'Напомнить завтра',
        callback_data: 'notify_calendar--next-day',
      };
      for (let to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          console.warn(`User from ${to} not found!`);
          continue;
        }

        // todo - данные нужно брать из тела activity.object.summaryMap.ru
        await bot.sendMessage(user.id, activity.summaryMap.ru, {
          protect_content: true,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [keyboardOpen],
              [keyboardLater, keyboardLater60],
              [keyboardLaterTomorrow],
            ],
          },
        });
      }
      break;
    }
    case 'Offer': {
      const keyboardOpen = {
        text: 'Посмотреть',
        url: activity.object,
      };
      const keyboardReject = {
        text: 'Отменить',
        callback_data: 'reject-offer',
      };
      const keyboardAccept = {
        text: 'Принять',
        callback_data: 'accept-offer',
      };
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          console.warn(`User from ${to} not found!`);
          continue;
        }
        // todo - данные нужно брать из тела activity.object.summaryMap.ru
        await bot.sendMessage(user.id, activity.summaryMap.ru, {
          protect_content: true,
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [keyboardOpen],
              [keyboardReject, keyboardAccept],
            ],
          },
        });
      }
      break;
    }
    default: {
      return response.status(422).send('Validation Type Failed');
    }
  }

  return response.status(202).send('Accepted');
}
