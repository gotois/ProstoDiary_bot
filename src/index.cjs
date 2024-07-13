const botController = require('telegram-bot-api-express');
const pingAction = require('./actions/system/ping.cjs');
const dbclearAction = require('./actions/system/dbclear.cjs');
const helpAction = require('./actions/system/help.cjs');
const offertaAction = require('./actions/system/offerta.cjs');
const registrationAction = require('./actions/system/registration.cjs');
const startAction = require('./actions/public/start.cjs');
const editedMessageTextAction = require('./actions/public/edited-message-text.cjs');
const channelPostAction = require('./actions/public/channel-post.cjs');
const textAction = require('./actions/public/text.cjs');
const locationAction = require('./actions/public/location.cjs');
const photoAction = require('./actions/public/photo.cjs');
const mentionAction = require('./actions/public/mention.cjs');
const documentAction = require('./actions/public/document.cjs');
const voiceAction = require('./actions/public/voice.cjs');
const videoAction = require('./actions/public/video.cjs');
const groupChatCreatedAction = require('./actions/public/group-chat-created.cjs');
const chatMembers = require('./actions/public/new-chat-members.cjs');
const migrateFromChatId = require('./actions/public/new-chat-members.cjs');
const leftChatMember = require('./actions/public/new-chat-members.cjs');
const channelChatCreated = require('./actions/public/new-chat-members.cjs');
const supergroupChatCreated = require('./actions/public/new-chat-members.cjs');
const stickerAction = require('./actions/public/sticker.cjs');
const animationAction = require('./actions/public/animation.cjs');
const pollAction = require('./actions/public/poll.cjs');
const audioAction = require('./actions/public/audio.cjs');
const contactAction = require('./actions/public/contact.cjs');
const inlineAction = require('./actions/public/inline.cjs');
const sendCalendar = require('./actions/public/send-calendar.cjs');

module.exports = ({ token = process.env.TELEGRAM_TOKEN, domain = process.env.TELEGRAM_DOMAIN }) => {
  return botController({
    token: token,
    domain: domain,

    // Персональные команды
    privateEvents: {
      /* MY COMMANDS */

      [/^\/(ping|пинг)$/]: pingAction,
      [/^\/dbclear$/]: dbclearAction,
      [/^\/start|начать$/]: startAction,
      [/^\/help|man|помощь$/]: helpAction,
      [/^\/licence/]: offertaAction,

      /* NATIVE COMMANDS */

      ['sticker']: stickerAction,
      ['animation']: animationAction,
      ['poll']: pollAction,
      ['text']: textAction,
      ['photo']: photoAction,
      ['voice']: voiceAction,
      ['audio']: audioAction,
      ['document']: documentAction,
      ['location']: locationAction,
      ['contact']: contactAction,

      /* CALLBACK */
      ['auth_by_contact']: registrationAction,
      ['send_calendar']: sendCalendar,
      ['inline_query']: inlineAction,
    },

    // Групповые команды
    publicEvents: {
      ['bot_command']: () => {
        // ignore any commands
      },

      /* TEXT */

      ['edited_message_text']: editedMessageTextAction,
      ['channel_post']: channelPostAction,
      ['mention']: mentionAction,
      ['text']: textAction,

      /* LOCATION */

      ['location']: locationAction,

      /* DATA */

      ['document']: documentAction,
      ['photo']: photoAction,
      ['voice']: voiceAction,
      ['video']: videoAction,

      /* GROUP COMMANDS */

      ['supergroup_chat_created']: supergroupChatCreated,
      ['channel_chat_created']: channelChatCreated,
      ['group_chat_created']: groupChatCreatedAction,
      ['new_chat_members']: chatMembers,
      ['migrate_from_chat_id']: migrateFromChatId,
      ['left_chat_member']: leftChatMember,
    },

    onError(bot, error) {
      console.error(error);
    },
  });
};
