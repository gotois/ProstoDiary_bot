const { bot } = require('./bot.cjs');
const { getUserByActorId } = require('../models/users.cjs');

module.exports = async (request, response) => {
  const activity = request.body?.credentialSubject;
  if (!activity) {
    return response.status(400).send('Validation Body Failed');
  }

  switch (activity.type) {
    case 'Create': {
      const keyboardEdit = {
        text: 'Изменить',
        url: activity.object,
      };
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          console.warn(`User from ${to} not found!`);
          continue;
        }

        // todo - данные нужно брать из тела activity.object.summaryMap.ru
        await bot.sendMessage(user.id, 'Задача создана', {
          protect_content: true,
          parse_mode: 'HTML',
          reply_markup: {
            /* eslint-disable prettier/prettier */
            inline_keyboard: [
              [keyboardEdit],
            ],
            /* eslint-enable */
          },
        });
      }
      break;
    }
    case 'Accept': {
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          continue;
        }
        await bot.sendMessage(user.id, 'Пользователь принял ваше предложение');
      }
      break;
    }
    case 'Reject': {
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          continue;
        }
        await bot.sendMessage(user.id, 'Пользователь отклонил ваше предложение');
      }
      break;
    }
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
      for (const to of activity.to) {
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
            /* eslint-disable prettier/prettier */
            inline_keyboard: [
              [keyboardOpen],
              [keyboardLater, keyboardLater60],
              [keyboardLaterTomorrow],
            ],
            /* eslint-enable */
          },
        });
      }
      break;
    }
    case 'Offer': {
      const uuid = activity.id.split('/').pop();
      const actorId = activity.actor.split('/').pop();
      const keyboardOpen = {
        text: 'Посмотреть',
        url: activity.object,
      };
      const keyboardReject = {
        text: 'Отменить',
        callback_data: `reject:${actorId}:${uuid}`,
      };
      const keyboardAccept = {
        text: 'Принять',
        callback_data: `accept:${actorId}:${uuid}`,
      };
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          console.warn(`User from ${to} not found!`);
          continue;
        }
        await bot.sendMessage(user.id, activity.summaryMap.ru, {
          protect_content: true,
          parse_mode: 'MarkdownV2',
          reply_markup: {
            /* eslint-disable prettier/prettier */
            inline_keyboard: [
              [keyboardOpen],
              [keyboardReject, keyboardAccept],
            ],
            /* eslint-enable */
          },
        });
      }
      break;
    }
    default: {
      return response.status(422).send(`Validation Type ${activity.type} Failed`);
    }
  }

  return response.status(202).send('Accepted');
};
