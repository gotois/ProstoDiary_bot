const express = require('express');
const argv = require('minimist')(process.argv.slice(2));
const botController = require('telegram-bot-api-express');
const { TELEGRAM } = require('./environments/index.cjs');
const pingAction = require('./actions/system/ping.cjs');
const dbclearAction = require('./actions/system/dbclear.cjs');
const helpAction = require('./actions/system/help.cjs');
const offertaAction = require('./actions/system/offerta.cjs');
const registrationByMiniAppAction = require('./actions/system/registration.cjs');
const registrationByPhoneAction = require('./actions/system/registration-phone.cjs');
const wantAction = require('./actions/system/want.cjs');
const startAction = require('./actions/public/start.cjs');
const editedMessageTextAction = require('./actions/public/edited-message-text.cjs');
const channelPostAction = require('./actions/public/channel-post.cjs');
const groupTextAction = require('./actions/public/text.cjs');
const locationAction = require('./actions/public/location.cjs');
const photoAction = require('./actions/public/photo.cjs');
const mentionAction = require('./actions/public/mention.cjs');
const documentAction = require('./actions/public/document.cjs');
const voiceAction = require('./actions/public/voice.cjs');
const videoAction = require('./actions/public/video.cjs');
const groupChatCreatedAction = require('./actions/public/group-chat-created.cjs');
const chatMembers = require('./actions/public/new-chat-members.cjs');
const migrateFromChat = require('./actions/public/migrate-from-chat.cjs');
const leftChatMember = require('./actions/public/left-chat-members.cjs');
const channelChatCreated = require('./actions/public/channel-chat-created.cjs');
const supergroupChatCreated = require('./actions/public/supergroup-chat-created.cjs');
const stickerAction = require('./actions/public/sticker.cjs');
const animationAction = require('./actions/public/animation.cjs');
const pollAction = require('./actions/public/poll.cjs');
const audioAction = require('./actions/public/audio.cjs');
const contactAction = require('./actions/public/contact.cjs');
const inlineAction = require('./actions/public/inline.cjs');
const textAction = require('./actions/private/text.cjs');
const textForwards = require('./actions/private/text-forwards.cjs');
const { notifyDice, notifyNextHour, notifyNextDay } = require('./actions/system/notifier.cjs');
const focusPomodoro = require('./actions/system/focus-pomodoro.cjs');
const generateCalendar = require('./actions/system/generate-calendar.cjs');
const checkAuth = require('./middleware/check-auth.cjs');
const errorHandler = require('./middleware/error-handler.cjs');
const replyToMessageAction = require('./actions/private/reply-to-message.cjs');

const app = express();
const port = Number(argv.port || 8888);

const { middleware } = botController({
  token: TELEGRAM.TOKEN,
  // domain: TELEGRAM.DOMAIN,

  // Персональные команды
  privateEvents: {
    /* MY COMMANDS */

    [/^\/(ping|пинг)$/]: errorHandler(pingAction),
    [/^\/dbclear$/]: checkAuth(dbclearAction),
    [/^\/start|начать$/]: errorHandler(startAction),
    [/^\/help|man|помощь$/]: errorHandler(helpAction),
    [/^\/licence/]: errorHandler(offertaAction),
    [/^\/want/]: checkAuth(wantAction),

    /* NATIVE COMMANDS */

    ['location']: checkAuth(locationAction),
    ['sticker']: checkAuth(stickerAction),
    ['animation']: checkAuth(animationAction),
    ['poll']: checkAuth(pollAction),
    ['mention']: checkAuth(mentionAction),
    ['edited_message_text']: checkAuth(editedMessageTextAction),
    ['text']: checkAuth(textAction),
    ['photo']: checkAuth(photoAction),
    ['voice']: checkAuth(voiceAction),
    ['audio']: checkAuth(audioAction),
    ['video']: checkAuth(videoAction),
    ['video_note']: checkAuth(videoAction),
    ['document']: checkAuth(documentAction),
    ['contact']: checkAuth(contactAction),
    ['inline_query']: inlineAction,
    ['message_forwards']: checkAuth(textForwards),
    ['reply_to_message']: checkAuth(replyToMessageAction),
    ['pinned_message']: () => {},

    /* CALLBACK */
    ['web_app_data']: (bot, message) => {
      const webAppData = JSON.parse(message.web_app_data.data);
      switch (webAppData.type) {
        case 'registration': {
          return registrationByMiniAppAction(bot, message, webAppData.data);
        }
        default: {
          console.warn('Unknown type:' + webAppData.type, webAppData);
          break;
        }
      }
    },
    ['auth_by_contact']: checkAuth(registrationByPhoneAction),
    ['generate_calendar']: checkAuth(generateCalendar),

    // Сделать напоминание того же события через 15 мин, 60 мин или на следующий день
    ['notify_calendar--15']: checkAuth(notifyDice),
    ['notify_calendar--60']: checkAuth(notifyNextHour),
    ['notify_calendar--next-day']: checkAuth(notifyNextDay),
    ['notify_calendar--start-pomodoro']: checkAuth(focusPomodoro),

    ['business_message']: () => {
      console.log('business_message');
    },
    ['edited_business_message']: () => {
      console.log('edited_business_message');
    },
    ['deleted_business_messages']: () => {
      console.log('deleted_business_messages');
    },
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

    ['approve_event']: () => {
      console.log('WIP: approve_event');
    },
  },

  onError(bot, error) {
    console.error(error);
  },
});

app.use(middleware);

app.get('/', (request, response) => {
  response.send('Pong');
});

app.listen(port, () => {
  console.log('Telegram Server is listening 🚀', port);
});
