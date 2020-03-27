const qs = require('qs');
const TelegramBotMessage = require('./models/message');
const logger = require('../../lib/log');
const { SERVER } = require('../../environment');
const { telegram, botCommands } = require('./commands');

module.exports = (telegramBot) => {
  const onAgree = async (message) => {
    logger.info('start.agree');
    // TODO: эти данные лучше не передавать на сторонний сервер.
    //  Лучше использовать какой-то безобидный id -
    //  например id текущей сессии, которая после колбэка будет уничтожаться в oauth.js
    const callbackValues = qs.stringify({
      telegram: {
        ...message,
      },
    });
    await telegramBot.deleteMessage(message.chat.id, message.message_id);
    await telegramBot.sendMessage(message.chat.id, 'Договор подписан', {
      reply_markup: {
        remove_keyboard: true,
      },
    });
    logger.info(`${SERVER.HOST}/connect/facebook?${callbackValues}`);
    logger.info(`${SERVER.HOST}/connect/yandex?${callbackValues}`);
    await telegramBot.sendMessage(
      message.chat.id,
      'Выберите способ авторизации:',
      {
        parse_mode: 'HTML',
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [
              {
                text: 'Yandex',
                url: `${SERVER.HOST}/connect/yandex?${callbackValues}`,
              },
              {
                text: 'Facebook',
                url: `${SERVER.HOST}/connect/facebook?${callbackValues}`,
              },
            ],
          ],
        },
      },
    );
  };
  /**
   * @param {TelegramMessage} message - message
   * @param {object} metadata - matcher
   * @param {string} metadata.type - matcher type
   * @returns {undefined}
   */
  const messageListener = async (message, metadata) => {
    const { type } = metadata;
    logger.info('telegram.message');
    try {
      const botMessage = new TelegramBotMessage(message);
      // подтверждение договора и первичная валидация установки через телеграм
      if (
        type === 'contact' &&
        !message.from.is_bot &&
        message.contact.user_id === message.from.id
      ) {
        await onAgree(message);
        return;
      }
      if (message.reply_to_message && message.reply_to_message.from.is_bot) {
        telegramBot.emit('reply_to_message', message, metadata);
        return;
      }
      switch (type) {
        case 'text': {
          // send commands
          for (const key of botCommands) {
            if (telegram[key].alias.test(message.text)) {
              await botMessage.sendCommand(telegram[key].event);
              return;
            }
          }
          // send text
          await botMessage.sendText();
          break;
        }
        case 'photo': {
          await botMessage.sendPhoto();
          break;
        }
        case 'document': {
          await botMessage.sendDocument();
          break;
        }
        case 'location': {
          await botMessage.sendLocation();
          break;
        }
        case 'voice': {
          await botMessage.sendVoice();
          break;
        }
        case 'group_chat_created': {
          await botMessage.groupChatCreated();
          break;
        }
        case 'new_chat_members': {
          await botMessage.newChatMembers();
          break;
        }
        case 'migrate_from_chat_id': {
          await botMessage.migrateFromChat();
          break;
        }
        default: {
          throw new Error(`Unknown ${type}. Enter /help`);
        }
      }
    } catch (error) {
      logger.error(error.stack);
      await telegramBot.sendMessage(message.chat.id, error.message);
    }
  };

  telegramBot.on('message', messageListener);
};
