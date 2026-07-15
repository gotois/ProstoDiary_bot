/* eslint-disable */
import botController from 'telegram-bot-api-express';
import pingAction from './handlers/ping.ts';
import dbclearAction from './handlers/dbclear.ts';
import clearAction from './handlers/clear.ts';
import helpAction from './handlers/help.ts';
import startAction from './handlers/start.ts';
import editedMessageTextAction from './handlers/edited-message-text.ts';
import channelPostAction from './handlers/channel-post.ts';
import groupTextAction from './handlers/group-text.ts';
import locationAction from './handlers/location.ts';
import photoAction from './handlers/photo.ts';
import mentionAction from './handlers/mention.ts';
import documentAction from './handlers/document.ts';
import voiceAction from './handlers/voice.ts';
import videoAction from './handlers/video.ts';
import groupChatCreatedAction from './handlers/group-chat-created.ts';
import chatMembers from './handlers/new-chat-members.ts';
import migrateFromChat from './handlers/migrate-from-chat.ts';
import leftChatMember from './handlers/left-chat-members.ts';
import channelChatCreated from './handlers/channel-chat-created.ts';
import supergroupChatCreated from './handlers/supergroup-chat-created.ts';
import stickerAction from './handlers/sticker.ts';
import animationAction from './handlers/animation.ts';
import pollAction from './handlers/poll.ts';
import audioAction from './handlers/audio.ts';
import contactAction from './handlers/contact.ts';
import inlineAction from './handlers/inline.ts';
import textAction from './handlers/text.ts';
import forwards from './handlers/text-forwards.ts';
import { notifyDice, notifyNextHour, notifyNextDay } from './handlers/notifier.ts';
import checkAuth from '../middleware/check-auth.ts';
import errorHandler from '../middleware/error-handler.ts';
import replyToMessageAction from './handlers/reply-to-message.ts';
import acceptCallback from './handlers/accept.ts';
import rejectCallback from './handlers/reject.ts';
import meetingRsvpAction from './handlers/meeting-rsvp.ts';
import { TELEGRAM } from '#env';
import { container, userRepository } from '../app/container.ts';

const { middleware, bot } = botController({
  token: TELEGRAM.TOKEN,
  // domain: TELEGRAM.DOMAIN,

  // Персональные команды
  privateEvents: {
    /* MY COMMANDS */

    [/^\/(ping|пинг)$/]: errorHandler(pingAction),
    [/^\/exit|выйти$/]: checkAuth(dbclearAction),
    [/^\/start|начать$/]: errorHandler(startAction),
    [/^\/help|man|помощь$/]: errorHandler(helpAction),
    [/^\/new$/]: () => checkAuth(clearAction),

    /* NATIVE COMMANDS */

    // ['location']: checkAuth(locationAction),
    ['sticker']: checkAuth(stickerAction),
    ['animation']: checkAuth(animationAction),
    // ['poll']: checkAuth(pollAction),
    // ['mention']: checkAuth(mentionAction),
    // ['edited_message_text']: checkAuth(editedMessageTextAction),
    ['text']: checkAuth(textAction),
    // ['photo']: checkAuth(photoAction),
    ['voice']: checkAuth(voiceAction),
    // ['audio']: checkAuth(audioAction),
    // ['video']: checkAuth(videoAction),
    // ['video_note']: checkAuth(videoAction),
    ['document']: checkAuth(documentAction),
    // ['contact']: checkAuth(contactAction),
    ['inline_query']: inlineAction,
    ['message_forwards']: checkAuth(forwards),
    ['reply_to_message']: checkAuth(replyToMessageAction),
    ['pinned_message']: () => {},

    /* CALLBACK */
    ['web_app_data']: async (_activity, message) => {
      console.log('message::', message);
      // TODO: валидировать JSON и схему каждого элемента до обработки. Сейчас некорректный
      // web_app_data бросает исключение, а произвольные `type`/`data` доходят до use case.
      const webAppData = JSON.parse(message.web_app_data.data);
      for (const { type, data } of webAppData) {
        switch (type) {
          case 'tz': {
            await container.user.updateUserTimezone({ telegramId: message.chat.id, timezone: data });
            break;
          }
          case 'location': {
            await container.user.updateUserLocation({ telegramId: message.chat.id, ...data });
            break;
          }
          default: {
            console.warn('Unknown type:' + webAppData.type, webAppData);
            break;
          }
        }
      }
    },

    ['notify_calendar--later']: checkAuth(notifyDice),
    ['notify_calendar--60']: checkAuth(notifyNextHour),
    ['notify_calendar--next-day']: checkAuth(notifyNextDay),

    [/^reject/]: rejectCallback,
    [/^accept/]: acceptCallback,

    // ['business_message']: () => {
    //   console.log('business_message');
    // },
    // ['edited_business_message']: () => {
    //   console.log('edited_business_message');
    // },
    // ['deleted_business_messages']: () => {
    //   console.log('deleted_business_messages');
    // },
  },

  // Групповые команды
  publicEvents: {
    ['bot_command']: () => {
      // ignore any commands
    },

    /* TEXT */

    ['channel_post']: channelPostAction,
    ['inline_query']: inlineAction,
    ['mention']: mentionAction,
    ['text']: groupTextAction,
    ['reply_to_message']: () => {},

    /* GROUP COMMANDS */

    ['supergroup_chat_created']: supergroupChatCreated,
    ['channel_chat_created']: channelChatCreated,
    ['group_chat_created']: groupChatCreatedAction,
    ['new_chat_members']: chatMembers,
    ['migrate_from_chat_id']: migrateFromChat,
    ['left_chat_member']: leftChatMember,

    ['video_chat_started']: () => {
      console.log('video_chat_started');
    },
    ['video_chat_ended']: () => {
      console.log('video_chat_ended');
    },

    /* CALLBACK */

    ['approve_event']: async (activity, message, bot) => {
      await bot.answerCallbackQuery(message.id, {
        text: 'Идет обработка...',
        show_alert: false,
      });
      console.log('WIP: approve_event');
    },

    [/^meeting_rsvp:\d+:(accept|reject)$/]: errorHandler(meetingRsvpAction),
  },

  onError(bot, error) {
    console.error(error);
  },
});

bot.on('message', async (message, activity) => {
  message = Array.isArray(message) ? message[0] : message;
  let user = userRepository.findById(message.chat.id);
  if (!user) {
    await container.user.ensureUser({
      telegramId: message.chat.id,
      language: message.from.language_code,
    });
    user = userRepository.findById(message.chat.id);
  }

  if (message.location) {
    activity.object = [
      {
        type: 'Point',
        content: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [message.location.latitude, message.location.longitude],
          },
        },
        mediaType: 'application/geo+json',
      },
    ];
    if (message.location?.caption) {
      activity.object.push({
        type: 'Note',
        content: message.location.caption,
        mediaType: 'text/plain',
      });
    }
  }
  // const botInfo = await bot.getMe();
  // if (botInfo.is_bot) {
  //   activity.origin.name = botInfo.first_name;
  //   activity.origin.url = 'https://t.me/' + botInfo.username;
  // }

  message.activity = activity;
  message.user = user;
});

export { bot };
export default middleware;
