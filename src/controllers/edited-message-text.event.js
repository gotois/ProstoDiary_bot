const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const APIv2 = require('../api/v2');
const dbEntries = require('../database/entities.database');
const TelegramBotRequest = require('./telegram-bot-request');

class EditMessageText extends TelegramBotRequest {
  /**
   * @constant
   * @type {string[]}
   */
  static get DELETE_VARIABLES() {
    return ['del', 'remove'];
  }
  constructor(message) {
    message.text = message.text.trim();
    super(message);
    // Сообщение удалено?
    if (
      EditMessageText.DELETE_VARIABLES.some((del) => {
        return message.text.toLowerCase() === del.toLowerCase();
      })
    ) {
      this.api = APIv2.remove;
    } else {
      this.api = APIv2.editedMessageTextAPI;
    }
  }

  async beginDialog() {
    logger.log('info', EditMessageText.name);
    if (this.message.text.startsWith('/')) {
      await bot.sendMessage(
        this.message.chat.id,
        'Редактирование этой записи невозможно',
      );
      return;
    }
    const isExist = await dbEntries.exist(
      this.message.from.id,
      this.message.message_id,
    );
    if (!isExist) {
      // TODO: если записи нет - тогда спрашиваем пользователя, создавать ли новую запись?
      await bot.sendMessage(this.message.chat.id, 'Запись не найдена');
      return;
    }
    const requestObject = jsonrpc.request('123', 'edit or delete');
    // TODO: https://github.com/gotois/ProstoDiary_bot/issues/34
    const result = await this.request(requestObject);
    await bot.sendMessage(this.message.chat.id, result, {
      parse_mode: 'Markdown',
    });
  }
}

/**
 * @description Обновление текста в БД
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
const onEditedMessageText = async (message) => {
  const editedMessageTextAPI = new EditMessageText(message);
  await editedMessageTextAPI.beginDialog();
};

module.exports = onEditedMessageText;
