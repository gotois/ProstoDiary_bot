const telegramBotExpress = require('telegram-bot-api-express');

const pingAction = require('./actions/private/ping');
const dbclearAction = require('./actions/private/dbclear');
const startAction = require('./actions/private/start');
const helpAction = require('./actions/private/help');
const backupAction = require('./actions/private/backup');
const authByContactAction = require('./actions/private/auth-by-contact');
const editedMessageTextAction = require('./actions/public/edited-message-text');
const channelPostAction = require('./actions/public/channel-post');
const textAction = require('./actions/public/text');
const locationAction = require('./actions/public/location');
const photoAction = require('./actions/public/photo');
const groupChatCreatedAction = require('./actions/public/group-chat-created');

module.exports = ({
  telegram,
}) => {
  return telegramBotExpress({
    token: telegram.token,
    domain: telegram.domain,
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
      ['mention']: () => {
        console.log('mention')
      },
      ['text']: textAction,

      /* LOCATION */

      ['location']: locationAction,

      /* DATA */

      ['document']: (bot, message) => {
        // ...
      },

      ['photo']: photoAction,

      ['voice']:  (bot, message) => {
        // ...
      },

      ['video']:  (bot, message) => {
        // ...
      },

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
