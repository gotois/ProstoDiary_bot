const activitystreams = require('telegram-bot-activitystreams');
const requestJsonRpc2 = require('request-json-rpc2');
const telegramBotExpress = require('telegram-bot-express');
const { v1: uuidv1 } = require('uuid');

module.exports = (token, domain, url) => telegramBotExpress({
    token: token,
    domain: domain,
    events: {
      ['message']: (bot, message) => {

      },
      ['edited_message_text']: (bot, message) => {

      },
      ['location']: (bot, message) => {

      },
      //  Очищение БД
      [/^\/dbclear$/]: (bot, message) => {

      },
      // Бот список вхождения? // использовать SPARQL запросы
      [/^бот|bot(\s)|\?$/]: (bot, message) => {

      },
      // Start
      [/^\/start|начать$/]: (bot, message) => {

      },
      [/^\/$/]: (bot, message) => {

      },
      ['bot_command']: (bot, message) => {

      },
      ['document']: (bot, message) => {

      },
      ['text']: (bot, message) => {

      },
      // Выгрузка бэкапа
      [/^\/(backup|бэкап)$/]: (bot, message) => {

      },
      // Помощь
      [/^\/help|man|помощь$/]: async (bot, message) => {
      },
      ['sticker']: (bot, message) => {

      },
      ['photo']: async (bot, message) => {

      },
      ['voice']:  (bot, message) => {
        console.log(message)
      },
      ['video']:  (bot, message) => {
        console.log('video', message)
      },
      // Проверка сети
      [/^\/(ping|пинг)$/]: async (bot, message) => {
        bot.sendChatAction(message.chat.id, 'typing');
        const activity = activitystreams(message);
        const result = await requestJsonRpc2({
          url: url,
          body: {
            id: uuidv1(),
            method: 'ping',
            params: activity,
          },
          headers: {
            'Accept': 'application/ld+json',
          },
        });
        bot.sendMessage(message.chat.id, result);
      },
      ['error']: (bot, msg) => {

      },
      ['reply_to_message']: (bot, msg) => {
        console.log('reply_to_message');
      },
      ['supergroup_chat_created']: (bot, msg) => {

      },
      ['channel_chat_created']: (bot, msg) => {

      },
      ['group_chat_created']: (bot, msg) => {

      },
      ['new_chat_members']: (bot, msg) => {

      },
      ['migrate_from_chat_id']: (bot, msg) => {

      },
      ['left_chat_member']: (bot, msg) => {

      },
    },
});
