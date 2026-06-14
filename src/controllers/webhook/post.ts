import type { Request, Response } from 'express';
import { bot } from '../bot.ts';
import { getUserByActorId } from '../../models/users.ts';

export default async (request: Request, response: Response): Promise<Response> => {
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
        await bot.sendMessage(user.id, `<a href="${activity.target}">Задача</a> создана`, {
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
      const actor = getUserByActorId(activity.actor);
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          continue;
        }
        await bot.sendMessage(user.id, `<a href="tg://user?id=${actor.id}">Пользователь</a> принял ваше предложение`, {
          parse_mode: 'HTML',
        });
      }
      break;
    }
    case 'Reject': {
      const actor = getUserByActorId(activity.actor);
      for (const to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          continue;
        }
        await bot.sendMessage(user.id, `<a href="tg://user?id=${actor.id}">Пользователь</a> отклонил ваше предложение`, {
          parse_mode: 'HTML',
        });
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
      const keyboardOpen = {
        text: 'Посмотреть',
        url: activity.object,
      };
      const keyboardReject = {
        text: 'Отменить',
        callback_data: `reject:${activity.object}`,
      };
      const keyboardAccept = {
        text: 'Принять',
        callback_data: `accept:${activity.object}`,
      };
      for (const to of activity.to) {
        if (activity.target?.type === 'Group' && activity.target.id === to) {
          continue;
        }
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
    case 'Add':
    case 'Invite':
    case 'Update':
    case 'Remove':
    case 'Delete':
    case 'Read':
    case 'Note':
    case 'Follow':
    case 'Like':
    case 'Dislike':
    case 'Arrive':
    case 'Leave': {
      break;
    }
    default: {
      return response.status(422).send(`Validation Type ${activity.type} Failed`);
    }
  }

  return response.status(202).send('Accepted');
};
