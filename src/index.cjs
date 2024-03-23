const bot = require('telegram-bot-api-express');

const pingAction = require('./actions/private/ping.cjs');
const dbclearAction = require('./actions/private/dbclear.cjs');
const startAction = require('./actions/private/start.cjs');
const helpAction = require('./actions/private/help.cjs');
const backupAction = require('./actions/private/backup.cjs');
const authByContactAction = require('./actions/private/auth-by-contact.cjs');
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

module.exports = ({
  token = process.env.TELEGRAM_TOKEN,
  domain = process.env.TELEGRAM_DOMAIN,
}) => {
  return bot({
    token: token,
    domain: domain,
    privateEvents: {

      /* MY COMMANDS */

      [/^\/(ping|пинг)$/]: pingAction,
      [/^\/dbclear$/]: dbclearAction,
      [/^\/start|начать$/]: startAction,
      [/^\/help|man|помощь$/]: helpAction,
      [/^\/(backup|бэкап)$/]: backupAction,

      /* NATIVE COMMANDS */

      ['auth_by_contact']: authByContactAction,

    },
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

      ['supergroup_chat_created']: (bot, message) => {
        // ...
      },

      ['channel_chat_created']: (bot, message) => {
        // ...
      },

      ['group_chat_created']: groupChatCreatedAction,

      ['new_chat_members']: (bot, message) => {
        // ...
        console.log('new_chat_members action')
      },

      ['migrate_from_chat_id']: (bot, message) => {
        // ...
      },

      ['left_chat_member']: (bot, message) => {
        // ...
      },
    },

    onError(bot, error) {
      console.error(error);
    },
  });
}
