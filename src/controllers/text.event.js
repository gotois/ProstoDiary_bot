const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const format = require('../services/format.service');
const logger = require('../services/logger.service');
const { IS_AVA_OR_CI } = require('../environment');
const commands = require('../core/commands');
const APIv2KPP = require('../api/v2/kpp');
const APIv2Text = require('../api/v2/text');
const TelegramBotRequest = require('./telegram-bot-request');
/**
 * @typedef {number} COMMANDS_ENUM
 **/
/**
 * @readonly
 * @enum {COMMANDS_ENUM}
 */
const COMMANDS_ENUM = {
  TELEGRAM_COMMAND: 0,
  TEXT: 1, // Запись в виде неформатированного текста
  KPP: 2, // 'Просмотр информации по своему кассовому чеку `String`'
};
class Text extends TelegramBotRequest {
  /**
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/74
   * @description Проверка текста на команды
   * @param {string} input - input text
   * @returns {COMMANDS_ENUM}
   */
  getInputType(input) {
    const isKPP = ['t=', 's=', 'fn=', 'i=', 'fp=', 'n='].every((value) => {
      return input.includes(value);
    });
    if (isKPP) {
      return COMMANDS_ENUM.KPP;
    }
    if (input.startsWith('/')) {
      return COMMANDS_ENUM.TELEGRAM_COMMAND;
    }
    return COMMANDS_ENUM.TEXT;
  }
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message) {
    super(message);
    switch (this.getInputType(message.text)) {
      case COMMANDS_ENUM.KPP: {
        this.api = APIv2KPP;
        break;
      }
      case COMMANDS_ENUM.TEXT: {
        // this.api = APIv2.mail; // todo uncomment
        this.api = APIv2Text; // todo test
        break;
      }
      default: {
        throw new Error('Unknown command. Enter /help');
      }
    }
  }
  onError(error) {
    throw error;
  }
  async beginDialog() {
    logger.log('info', Text.name);
    if (this.message.reply_to_message instanceof Object) {
      if (!this.message.reply_to_message.from.is_bot) {
        await bot.sendMessage(
          this.message.chat.id,
          'Reply message not supported',
        );
        return;
      }
      return;
    }
    // Пропускаем зарезервированные команды
    for (const command of Object.keys(commands)) {
      if (this.message.text.search(commands[command].alias) >= 0) {
        await bot.sendMessage(this.message.chat.id, 'Search command error');
        return;
      }
    }
    const { message_id } = await bot.sendMessage(
      this.message.chat.id,
      `_${format.previousInput(this.message.text)}_ 📝`,
      {
        parse_mode: 'Markdown',
        disable_notification: true,
        disable_web_page_preview: true,
      },
    );
    const requestObject = jsonrpc.request('123', 'text', {
      buffer: Buffer.from(this.message.text),
    });
    try {
      const result = await this.request(requestObject);
      await bot.editMessageText(result, {
        chat_id: this.message.chat.id,
        message_id: message_id,
      });
    } catch (error) {
      await bot.editMessageText(error.message, {
        chat_id: this.message.chat.id,
        message_id: message_id,
      });
    }
  }
}

/**
 * @todo символ `/` означает что запись будет точно в историю. Пример:
 * /
 * вчера вечером был фитнес
 *
 * @param {TelegramMessage} message - message
 * @param {any} match - matcher
 * @returns {Promise<undefined>}
 */
const onText = async (message, match) => {
  if (match.type !== 'text') {
    return;
  }
  // Пропускаем команды бота от AVA Server
  if (IS_AVA_OR_CI) {
    if (message.text.startsWith('/')) {
      return;
    }
  }
  // Пропускаем команды бота
  if (message.entities) {
    if (
      message.entities.some((entity) => {
        return entity.type === 'bot_command';
      })
    ) {
      // todo в случаях когда пользователь просто ввел команду без параметров (/search или похожее) то предусмотреть переброс контроллера
      return;
    }
  }
  const text = new Text(message);
  await text.beginDialog();
};

module.exports = onText;
