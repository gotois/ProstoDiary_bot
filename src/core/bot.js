const qs = require('qs');
const TelegramBot = require('node-telegram-bot-api');
const logger = require('../services/logger.service');
const { telegram, botCommands } = require('../include/telegram-bot/commands');
const {
  IS_PRODUCTION,
  IS_CRON,
  IS_AVA_OR_CI,
  TELEGRAM,
  SERVER,
  NGROK,
} = require('../environment');
let telegramBot;
if (IS_AVA_OR_CI || IS_CRON) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN, {
    polling: true,
    baseApiUrl: TELEGRAM.API_URL,
  });
  telegramBot.startPolling({ restart: false });
} else if (IS_PRODUCTION) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  telegramBot.setWebHook(`${SERVER.HEROKUAPP}/bot${TELEGRAM.TOKEN}`, {
    max_connections: 10,
  });
  telegramBot.on('webhook_error', (error) => {
    logger.log('error', error.toString());
  });
} else {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  if (NGROK.URL) {
    telegramBot.setWebHook(`${SERVER.HOST}/bot${TELEGRAM.TOKEN}`, {
      max_connections: 3,
    });
    telegramBot.on('webhook_error', (error) => {
      logger.log('error', error.toString());
    });
  } else {
    telegramBot.startPolling({ restart: false });
    telegramBot.on('polling_error', (error) => {
      logger.log('error', error.toString());
    });
  }
}
const checkMentionMessage = (message) => {
  if (Array.isArray(message.entities)) {
    return message.entities.some((entity) => {
      return entity.type === 'mention';
    });
  }
  return false;
};
/**
 * @param {TelegramMessage} message - message
 * @returns {undefined}
 */
const checkMessage = (message) => {
  // Пропускаем команды бота
  if (Array.isArray(message.entities)) {
    if (message.entities[0].type === 'bot_command') {
      // Пропускаем зарезервированные команды
      const commandReserved = botCommands.some((command) => {
        return message.text.search(telegram[command].alias) >= 0;
      });
      if (!commandReserved) {
        throw new Error('Unknown command. Enter /help');
      }
    }
  }
};
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
  logger.info('core.bot.message');
  try {
    // подтверждение договора и первичная валидация установки через телеграм
    if (
      type === 'contact' &&
      !message.from.is_bot &&
      message.contact.user_id === message.from.id
    ) {
      await onAgree(message);
      return;
    }
    if (!message.passport) {
      throw new Error('gotois message error');
    }
    if (message.reply_to_message instanceof Object) {
      if (!message.reply_to_message.from.is_bot) {
        throw new Error('Reply message not supported');
      } else {
        telegramBot.emit('reply_to_message', message, metadata);
        return;
      }
    }
    if (message.chat && message.chat.type === 'supergroup') {
      if (!checkMentionMessage(message)) {
        return;
      }
    }
    switch (type) {
      case 'text': {
        checkMessage(message);
        if (message.reply_to_message) {
          if (message.passport.activated) {
            return;
          }
          // если бот не активирован, то проверяем что он прислал код авторизации
          await require('../controllers/telegram/signin.event')(message);
          return;
        }
        for (const key of botCommands) {
          if (telegram[key].alias.test(message.text)) {
            await require('../controllers/telegram/' + telegram[key].event)(
              message,
            );
            return;
          }
        }
        await require('../controllers/telegram/text.event')(message);
        break;
      }
      case 'photo': {
        await require('../controllers/telegram/photo.event')(message);
        break;
      }
      case 'document': {
        await require('../controllers/telegram/document.event')(message);
        break;
      }
      case 'location': {
        await require('../controllers/telegram/location.event')(message);
        break;
      }
      case 'voice': {
        await require('../controllers/telegram/voice.event')(message);
        break;
      }
      case 'group_chat_created': {
        await require('../controllers/telegram/group-chat-created.event')(
          message,
        );
        break;
      }
      case 'new_chat_members': {
        await require('../controllers/telegram/new-chat-members.event')(
          message,
        );
        break;
      }
      case 'migrate_from_chat_id': {
        // todo
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
/**
 * @type {TelegramBot}
 */
module.exports = telegramBot;
