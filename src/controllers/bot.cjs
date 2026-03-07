const activitystreams = require('telegram-bot-activitystreams');
// const botController = require('telegram-bot-api-express');
const botController = require('../../../telegram-bot-api-express/index.cjs');
const { TELEGRAM } = require('../environments/index.cjs');
const pingAction = require('../actions/system/ping.cjs');
const dbclearAction = require('../actions/system/dbclear.cjs');
const helpAction = require('../actions/system/help.cjs');
const authByPhone = require('../actions/system/registration-phone.cjs');
const wantAction = require('../actions/system/want.cjs');
const startAction = require('../actions/public/start.cjs');
const editedMessageTextAction = require('../actions/public/edited-message-text.cjs');
const channelPostAction = require('../actions/public/channel-post.cjs');
const groupTextAction = require('../actions/public/text.cjs');
const locationAction = require('../actions/public/location.cjs');
const photoAction = require('../actions/public/photo.cjs');
const mentionAction = require('../actions/public/mention.cjs');
const documentAction = require('../actions/public/document.cjs');
const voiceAction = require('../actions/public/voice.cjs');
const videoAction = require('../actions/public/video.cjs');
const groupChatCreatedAction = require('../actions/public/group-chat-created.cjs');
const chatMembers = require('../actions/public/new-chat-members.cjs');
const migrateFromChat = require('../actions/public/migrate-from-chat.cjs');
const leftChatMember = require('../actions/public/left-chat-members.cjs');
const channelChatCreated = require('../actions/public/channel-chat-created.cjs');
const supergroupChatCreated = require('../actions/public/supergroup-chat-created.cjs');
const stickerAction = require('../actions/public/sticker.cjs');
const animationAction = require('../actions/public/animation.cjs');
const pollAction = require('../actions/public/poll.cjs');
const audioAction = require('../actions/public/audio.cjs');
const contactAction = require('../actions/public/contact.cjs');
const inlineAction = require('../actions/public/inline.cjs');
const textAction = require('../actions/private/text.cjs');
const textForwards = require('../actions/private/text-forwards.cjs');
const { notifyDice, notifyNextHour, notifyNextDay } = require('../actions/system/notifier.cjs');
const focusPomodoro = require('../actions/system/focus-pomodoro.cjs');
const checkAuth = require('../middleware/check-auth.cjs');
const errorHandler = require('../middleware/error-handler.cjs');
const replyToMessageAction = require('../actions/private/reply-to-message.cjs');
const {
  setJWT,
  updateUserLocation,
  updateUserTimezone,
  getUser,
  setNewUser,
  deleteUser,
  setLanguage,
} = require('../models/users.cjs');

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
    [/^\/newchat$/]: () => {
      console.log('TODO: очистка истории агента и запуск нового чата');
    },

    /* NATIVE COMMANDS */

    // ['location']: checkAuth(locationAction),
    // ['sticker']: checkAuth(stickerAction),
    // ['animation']: checkAuth(animationAction),
    // ['poll']: checkAuth(pollAction),
    // ['mention']: checkAuth(mentionAction),
    // ['edited_message_text']: checkAuth(editedMessageTextAction),
    ['text']: checkAuth(textAction),
    // ['photo']: checkAuth(photoAction),
    // ['voice']: checkAuth(voiceAction),
    // ['audio']: checkAuth(audioAction),
    // ['video']: checkAuth(videoAction),
    // ['video_note']: checkAuth(videoAction),
    // ['document']: checkAuth(documentAction),
    // ['contact']: checkAuth(contactAction),
    // ['inline_query']: inlineAction,
    // ['message_forwards']: checkAuth(textForwards),
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

    // Сделать напоминание того же события через 15 мин, 60 мин или на следующий день
    // ['notify_calendar--15']: checkAuth(notifyDice),
    // ['notify_calendar--60']: checkAuth(notifyNextHour),
    // ['notify_calendar--next-day']: checkAuth(notifyNextDay),
    // ['notify_calendar--start-pomodoro']: checkAuth(focusPomodoro),

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

bot.on('message', (message) => {
  message = Array.isArray(message) ? message[0] : message;
  let user = getUser(message.chat.id);
  if (!user) {
    user = setNewUser(message.chat.id);
    setLanguage(user.id, message.from.language_code);
  }

  // todo поддержать функционал JWT истечения
  // JWT истек? -->
  //    [Bot Server делает POST /oidc/token с grant_type=refresh_token]
  //    [OIDC Server проверяет refresh_token и выдает новый access_token (+ опционально новый refresh_token)]

  const activity = activitystreams(message);
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

module.exports = middleware;
module.exports.bot = bot;
