const activitystreams = require('telegram-bot-activitystreams');
const requestJsonRpc2 = require('request-json-rpc2');
const telegramBotExpress = require('telegram-bot-api-express');
const { v1: uuidv1 } = require('uuid');
const { createRestAPIClient } = require('masto');

/**
 * 'Some' => 'Some…'
 * '123456789' => '123456…'
 *
 * @description Message updated text
 * @param {string} input - user input text
 * @returns {string}
 */
const previousInput = (input) => {
  return `${input.replace(/\n/g, ' ').slice(0, 6)}…`;
};

module.exports = ({
  telegram,
  fediverse,
}) => {
  const masto = createRestAPIClient({
    url: fediverse.url,
    accessToken: fediverse.token,
  });

  return telegramBotExpress({
    token: telegram.token,
    domain: telegram.domain,
    events: {

      /* TEXT */

      ['edited_message_text']: async (bot, message) => {
        if (message.text.startsWith('/')) {
          await bot.sendMessage(message.chat.id, 'Редактирование этой записи невозможно');
        }
        // ...
        await bot.sendMessage(message.chat.id, `Запись ${previousInput(message.text)} обновлена`);
      },

      // ['text']: (bot, message) => {
      // },

      /* TEXT COMMANDS */

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
            url: telegram.url,
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

      // Начало работы
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

      // Проверка сети
      [/^\/(ping|пинг)$/]: async (bot, message) => {
        bot.sendChatAction(message.chat.id, 'typing');
        const { result } = await requestJsonRpc2({
          url: url,
          body: {
            id: uuidv1(),
            method: 'hello',
            params: activitystreams(message),
          },
          headers: {
            Accept: 'text/markdown',
          },
          // jwt: assistant.token, // todo использовать
          // signature: verificationMethod // todo использовать
        });
        await bot.sendMessage(message.chat.id, result, {
          parse_mode: 'Markdown',
        },);
      },

      // Помощь
      [/^\/help|man|помощь$/]: function (bot, message) {
        const commands = Object.keys(this);
        let commandsReadable = '';
        commands.forEach(c => {
          commandsReadable += c + '\n';
        });

        bot.sendMessage(message.chat.id, 'Используйте команды: ' + commandsReadable);
      },

      // Выгрузка бэкапа - Скачивание файла БД на устройство
      [/^\/(backup|бэкап)$/]: async (bot, message) => {
        const { result } = await requestJsonRpc2({
          url: url,
          body: {
            id: uuidv1(),
            method: 'backup',
          },
          // jwt: assistant.token,
          // signature: verificationMethod
          headers: {
            Accept: 'application/ld+json',
          },
          // jwt: assistant.token, // todo использовать
          // signature: verificationMethod // todo использовать
        });

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
      },

      //   [/^\/$/]: (bot, message) => {
      //   },

      /* DATA */

      ['document']: (bot, message) => {
        // ...
      },

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

      ['voice']:  (bot, message) => {
        // ...
      },

      ['video']:  (bot, message) => {
        // ...
      },

      /* NATIVE COMMANDS */

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

      /* LOCATION */

      ['location']: (bot, message) => {
        // const activity = activitystreams(message);
      },

      /* GROUP COMMANDS */

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
    onError(bot, error) {
      console.error(error);
    },
  });
}
