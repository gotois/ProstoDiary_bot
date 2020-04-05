const TelegramBotMessage = require('./models/telegram-bot-message');
const logger = require('../../lib/log');
const { telegram, botCommands } = require('./commands');
const { pool } = require('../../db/sql');
const assistantChatQueries = require('../../db/selectors/chat');
const assistantQueries = require('../../db/selectors/assistant');

module.exports = (telegramBot) => {
  // @todo перенести это в /start.event.js
  const onAgree = async (message) => {
    logger.info('start.agree');
    // это перенести в модель, чтобы можно было повторно использовать с chat
    await pool.connect(async (connection) => {
      const assistantBot = await connection.one(
        assistantQueries.selectAssistantIdByUserPhone(
          message.contact.phone_number,
        ),
      );
      await connection.query(
        assistantChatQueries.createChat({
          id: message.chat.id,
          name: message.chat.username,
          assistant_bot_id: assistantBot.id,
        }),
      );
      // Ассистент детектирует бота пользователя, запрашивает 2FA
      // ...
    });
    await telegramBot.deleteMessage(message.chat.id, message.message_id);
    await telegramBot.sendMessage(
      message.chat.id,
      'Создан новый чат с ассистентом',
      {
        reply_markup: {
          remove_keyboard: true,
        },
      },
    );
    const me = await telegramBot.getMe();
    await telegramBot.sendMessage(
      message.chat.id,
      `Приветствую ${message.chat.first_name}!\n` +
        `Я твой персональный бот __${me.first_name}__.\n` +
        'Узнай все мои возможности командой /help.',
      {
        parse_mode: 'Markdown',
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
        case 'left_chat_member': {
          await botMessage.leftChatMember();
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
