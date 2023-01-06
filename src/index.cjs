const activitystreams = require('telegram-bot-activitystreams');
const requestJsonRpc2 = require('request-json-rpc2');
const telegramBotExpress = require('telegram-bot-api-express');
const { v1: uuidv1 } = require('uuid');
// const { Ed25519KeyPair } = require('crypto-ld');
// const linkedDataSignature = require('../../../services/linked-data-signature.service');
// const crypt = require('../../services/crypt.service');

module.exports = (token, domain, url) => {
  return telegramBotExpress({
    token: token,
    domain: domain,
    events: {
      ['edited_message_text']: async (bot, message) => {
        if (message.text.startsWith('/')) {
          await bot.sendMessage(message.chat.id, 'Редактирование этой записи невозможно');
        }
      },
      // ['location']: (bot, message) => {
      //   const activity = activitystreams(message);
      // },
      // todo: нужно проверять выгружен ли был бэкап, и если нет - предупреждать пользователя
      // Очистить базу данных с подтверждением - Удаление всей истории пользователя целиком
      [/^\/dbclear$/]: async (bot, message) => {
        const { message_id } = await bot.sendMessage(message.chat.id, 'Очистить ваши записи?\nНапишите: YES', {
          reply_markup: {
            force_reply: true,
          },
        });
        bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
          if (text !== 'YES') {
            await bot.sendMessage(message.chat.id, 'Операция отменена пользователем');
            return;
          }
          const activity = activitystreams(message);

          const result = await requestJsonRpc2({
            url: url,
            body: {
              id: uuidv1(),
              method: 'dbclear',
              params: {
                ...activity,
              },
            },
            // jwt: assistant.token,
            // signature: verificationMethod
            headers: {
              Accept: 'application/ld+json',
            },
            // jwt: assistant.token, // todo использовать
            // signature: verificationMethod // todo использовать
          });
          await bot.sendMessage(message.chat.id, result);
        });
      },
      // Бот список вхождения? // использовать SPARQL запросы
      // [/^бот|bot(\s)|\?$/]: (bot, message) => {
      // },
      ['auth_by_contact']: async (bot, message) => {
        // const activity = activitystreams(message);

        // Ассистент детектирует бота пользователя, запрашивает 2FA
        // ...

        await bot.deleteMessage(message.chat.id, message.message_id);
        const me = await bot.getMe();
        await bot.sendMessage(
          message.chat.id,
          `Приветствую ${message.chat.first_name}!\n` +
            `Я твой персональный бот __${me.first_name}__.\n` +
            'Узнай все мои возможности командой /help.',
          {
            reply_markup: {
              remove_keyboard: true,
            },
            parse_mode: 'Markdown',
          },
        );
      },
      // Start
      [/^\/start|начать$/]: async (bot, message) => {
        // раскоментировать
        /* if (message.passports.length > 0) {
            const message = 'Повторная установка не требуется\n\n' + '/help - помощь';
            await bot.sendMessage(this.message.chat.id, message);
            return;
          } */

        // Выводим оферту
        const offerta = await requestJsonRpc2({
          url: url,
          body: {
            id: uuidv1(),
            method: 'offerta',
            params: {
              // ...activity,
            },
          },
          headers: {
            Accept: 'application/ld+json',
          },
        });

        await bot.sendMessage(message.chat.id, offerta, {
          parse_mode: 'Markdown',
          disable_notification: true,
          reply_markup: {
            keyboard: [[{ text: 'Agree', request_contact: true }]],
            one_time_keyboard: true,
          },
        });
      },
      //   [/^\/$/]: (bot, message) => {
      //   },
      // ['document']: (bot, message) => {
      // },
      // ['text']: (bot, message) => {
      // },
      // Выгрузка бэкапа - Скачивание файла БД на устройство
      // [/^\/(backup|бэкап)$/]: async (bot, message) => {
      //   const result = await requestJsonRpc2({
      //     url: url,
      //     body: {
      //       id: uuidv1(),
      //       method: 'backup',
      //       params: activity,
      //     },
      //     // jwt: assistant.token,
      //     // signature: verificationMethod
      //     headers: {
      //       Accept: 'application/ld+json',
      //     },
      //     // jwt: assistant.token, // todo использовать
      //     // signature: verificationMethod // todo использовать
      //   });
      //
      //   const authMessage = await this.bot.sendMessage(
      //     this.message.chat.id,
      //     'Введите ключ двухфакторной аутентификации',
      //     {
      //       parse_mode: 'Markdown',
      //       reply_markup: {
      //         force_reply: true,
      //       },
      //     },
      //   );
      //   // запрашиваем ключ от двухфакторной аутентификации
      //   bot.onReplyToMessage(message.chat.id, authMessage.message_id, ({ text }) => {});
      //
      //   await Promise.all(
      //     attachments.map((attachment) => {
      //       return bot.sendDocument(
      //         chatId,
      //         Buffer.from(attachment.content, 'base64'),
      //         {
      //           caption: subject,
      //           parse_mode: parseMode,
      //           disable_notification: true,
      //         },
      //         {
      //           filename: attachment.filename,
      //           contentType: attachment.type,
      //         },
      //       );
      //     }),
      //   );
      // },
      // Помощь
      // [/^\/help|man|помощь$/]: async (bot, message) => {
      //   console.log(message);
      // },
      // ['photo']: async (bot, message) => {
      //   const activity = activitystreams(message);
      //   console.log('activity', activity)
      //
      //   // получение файла телеграма
      //   const res = await fetch(message.photo[0].file.url);
      //   if (res.status !== 200) {
      //     throw await Promise.reject("Status was not 200");
      //   }
      //   const buffer = await res.arrayBuffer();
      //
      //   bot.sendPhoto(
      //       message.chat.id,
      //       Buffer.from(buffer),
      //       {
      //         caption: 'kek',
      //       },
      //       {
      //         filename: 'kek',
      //         contentType: 'image/png',
      //       },
      //     );
      // },
      // ['voice']:  (bot, message) => {
      // },
      // ['video']:  (bot, message) => {
      // },
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
          // jwt: assistant.token,
          // signature: verificationMethod
          headers: {
            Accept: 'application/ld+json',
          },
          // jwt: assistant.token, // todo использовать
          // signature: verificationMethod // todo использовать
        });
        // end

        await bot.sendMessage(message.chat.id, result);
      },
      // todo еще поддержать неизвестные команды - то есть те, когда вообще непонятно что было нажато
      ['error']: (/*bot, msg*/) => {
        throw new Error('Unknown command. Enter /help');
      },
      // ['supergroup_chat_created']: (bot, msg) => {
      // },
      // ['channel_chat_created']: (bot, msg) => {
      // },
      // ['group_chat_created']: (bot, msg) => {
      // },
      // ['new_chat_members']: (bot, msg) => {
      // },
      // ['migrate_from_chat_id']: (bot, msg) => {
      // },
      // ['left_chat_member']: (bot, msg) => {
      // },
    },
  });
};
