/* eslint-disable */
import botController from 'telegram-bot-api-express';
import env from '../environments/index.mjs';
import pingAction from '../actions/system/ping.mjs';
import dbclearAction from '../actions/system/dbclear.mjs';
import clearAction from '../actions/system/clear.mjs';
import helpAction from '../actions/system/help.mjs';
import authByPhone from '../actions/system/registration-phone.mjs';
import wantAction from '../actions/system/want.mjs';
import startAction from '../actions/public/start.mjs';
import editedMessageTextAction from '../actions/public/edited-message-text.mjs';
import channelPostAction from '../actions/public/channel-post.mjs';
import groupTextAction from '../actions/public/text.mjs';
import locationAction from '../actions/public/location.mjs';
import photoAction from '../actions/public/photo.mjs';
import mentionAction from '../actions/public/mention.mjs';
import documentAction from '../actions/public/document.mjs';
import voiceAction from '../actions/public/voice.mjs';
import videoAction from '../actions/public/video.mjs';
import groupChatCreatedAction from '../actions/public/group-chat-created.mjs';
import chatMembers from '../actions/public/new-chat-members.mjs';
import migrateFromChat from '../actions/public/migrate-from-chat.mjs';
import leftChatMember from '../actions/public/left-chat-members.mjs';
import channelChatCreated from '../actions/public/channel-chat-created.mjs';
import supergroupChatCreated from '../actions/public/supergroup-chat-created.mjs';
import stickerAction from '../actions/public/sticker.mjs';
import animationAction from '../actions/public/animation.mjs';
import pollAction from '../actions/public/poll.mjs';
import audioAction from '../actions/public/audio.mjs';
import contactAction from '../actions/public/contact.mjs';
import inlineAction from '../actions/public/inline.mjs';
import textAction from '../actions/private/text.mjs';
import forwards from '../actions/private/text-forwards.mjs';
import { notifyDice, notifyNextHour, notifyNextDay } from '../actions/system/notifier.mjs';
import checkAuth from '../middleware/check-auth.mjs';
import errorHandler from '../middleware/error-handler.mjs';
import replyToMessageAction from '../actions/private/reply-to-message.mjs';
import { updateUserLocation, updateUserTimezone, getUser, setNewUser, setLanguage } from '../models/users.mjs';
import acceptCallback from '../actions/private/accept.mjs';
import rejectCallback from '../actions/private/reject.mjs';

const { TELEGRAM } = env;

const { middleware, bot } = botController({
  token: TELEGRAM.TOKEN,
  // domain: TELEGRAM.DOMAIN,

  // Персональные команды
  privateEvents: {
    /* MY COMMANDS */

    [/^\/(ping|пинг)$/]: errorHandler(pingAction),
    [/^\/exit|выйти$/]: checkAuth(dbclearAction),
    [/^\/start|начать$/]: errorHandler(startAction),
    // [/^\/help|man|помощь$/]: errorHandler(helpAction),
    // [/^\/want/]: checkAuth(wantAction),
    [/^\/new$/]: () => checkAuth(clearAction),

    /* NATIVE COMMANDS */

    // ['location']: checkAuth(locationAction),
    // ['sticker']: checkAuth(stickerAction),
    // ['animation']: checkAuth(animationAction),
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
    // ['inline_query']: inlineAction,
    ['message_forwards']: checkAuth(forwards),
    ['reply_to_message']: checkAuth(replyToMessageAction),
    // ['pinned_message']: () => {},

    /* CALLBACK */
    ['web_app_data']: (bot, message) => {
      console.log('message::', message);
      const webAppData = JSON.parse(message.web_app_data.data);
      for (const { type, data } of webAppData) {
        switch (type) {
          case 'tz': {
            updateUserTimezone(message.chat.id, data);
            break;
          }
          case 'location': {
            updateUserLocation(message.chat.id, data);
            break;
          }
          default: {
            console.warn('Unknown type:' + webAppData.type, webAppData);
            break;
          }
        }
      }
    },
    ['auth_by_contact']: authByPhone,

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

    ['approve_event']: async (bot, message) => {
      await bot.answerCallbackQuery(message.id, {
        text: 'Идет обработка...',
        show_alert: false,
      });
      console.log('WIP: approve_event');
    },
  },

  onError(bot, error) {
    console.error(error);
  },
});

bot.on('message', (activity, message) => {
  message = Array.isArray(message) ? message[0] : message;
  let user = getUser(message.chat.id);
  if (!user) {
    user = setNewUser(message.chat.id);
    setLanguage(user.id, message.from.language_code);
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
    if (message.location.caption) {
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

