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
    privateEvents: {

      /* ACTIONS */

      // Проверка сети
      [/^\/(ping|пинг)$/]: async (bot, message) => {
        bot.sendChatAction(message.chat.id, 'typing');

        // const { result } = await requestJsonRpc2({
        //   url: url,
        //   body: {
        //     id: uuidv1(),
        //     method: 'hello',
        //     params: activitystreams(message),
        //   },
        //   headers: {
        //     Accept: 'text/markdown',
        //   },
        //   // jwt: assistant.token, // todo использовать
        //   // signature: verificationMethod // todo использовать
        // });
        // await bot.sendMessage(message.chat.id, result, {
        //   parse_mode: 'Markdown',
        // },);
      },

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
        console.log('start action')
        const me = await bot.getMe();

        await bot.sendMessage(
          message.chat.id,
          `Приветствую **${message.chat.first_name}**!\n` +
          `Я куратор __${me.first_name}__.\n` +
          'Добавь меня в дискуссию.\n' +
          'Узнай подробности командой /help.',
          {
            reply_markup: {
              remove_keyboard: true,
            },
            parse_mode: 'Markdown',
          },
        );
        if (message.passports.length > 0) {
          const message = 'Повторная установка не требуется\n\n' + '/help - помощь';
          await bot.sendMessage(this.message.chat.id, message);
          return;
        }

        await bot.sendMessage(message.chat.id, 'Предоставьте свои контакты', {
          parse_mode: 'Markdown',
          disable_notification: true,
          reply_markup: {
            keyboard: [[{ text: 'Agree', request_contact: true }]],
            one_time_keyboard: true,
          },
        });
      },

      // Помощь
      [/^\/help|man|помощь$/]: (bot, message) => {
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
        // --запрашиваем 2FA: ключ от двухфакторной аутентификации--
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

      ['auth_by_contact']: async (bot, message) => {
        // Ассистент детектирует пользователя
        console.log('auth_by_contact', bot)
        console.log('auth_by_contact', message)
        const activity = activitystreams(message);
        console.log('activity', activity)

        // ...

        await bot.deleteMessage(message.chat.id, message.message_id);
      },
    },
    publicEvents: {
      ['bot_command']: () => {
        // ignore any commands
      },

      /* TEXT */

      ['edited_message_text']: async (bot, message) => {
        if (message.text.startsWith('/')) {
          await bot.sendMessage(message.chat.id, 'Редактирование этой записи невозможно');
        }
        // ...
        await bot.sendMessage(message.chat.id, `Запись ${previousInput(message.text)} обновлена`);
      },

      ['channel_post']: (bot, message) => {
        const activity = activitystreams(message);
        console.log('channel', activity)
        // ...
      },

      ['mention']: () => {
        console.log('mention')
      },

      ['text']: async (bot, message) => {
        console.log('message', message)
        const activity = activitystreams(message);
        console.log('activity:', activity)
        console.log(activity.object[0].content)

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

      /* LOCATION */

      ['location']: (bot, message) => {
        // const activity = activitystreams(message);
      },

      /* DATA */

      ['document']: (bot, message) => {
        // ...
      },

      ['photo']: async (bot, message) => {
        const activity = activitystreams(message);
        console.log('activity', activity)

        // получение файла телеграма
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
      },

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

      ['group_chat_created']: async (bot, message) => {
        await bot.sendMessage(
          message.chat.id,
          `Приветствую! Я куратор.\n` +
          `Проанализирую ваши активности и сформирую из них контракты.`,
          {
            parse_mode: 'Markdown',
          },
        );
      },

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
