const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');

class EditMessageText extends TelegramBotRequest {
  /**
   * @constant
   * @type {string[]}
   */
  static get DELETE_VARIABLES() {
    return ['del', 'remove'];
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    if (this.message.text.startsWith('/')) {
      await this.bot.sendMessage(
        this.message.chat.id,
        'Редактирование этой записи невозможно',
      );
      return;
    }

    // fixme
    const { text, date, telegram_message_id, telegram_user_id } = requestObject;

    // fixme
    // if (!isExist) {
    // TODO: если записи нет - тогда спрашиваем пользователя, создавать ли новую запись?
    // await bot.sendMessage(this.message.chat.id, 'Запись не найдена');
    // return;
    // }
    // todo перенести это в telegram-bot-message.js с новым типом delete-text
    // Сообщение удалено?
    if (
      EditMessageText.DELETE_VARIABLES.some((del) => {
        return this.message.text.toLowerCase() === del.toLowerCase();
      })
    ) {
      const deleteAction = {
        '@context': 'http://schema.org',
        '@type': 'AllocateAction',
        'agent': {
          '@type': 'Person',
          'name': package_.name,
          'url': package_.homepage,
        },
        'name': 'RemoveMessage',
        'subjectOf': [
          {
            '@type': 'CreativeWork',
            'name': 'id',
            'abstract': id,
            'encodingFormat': 'text/plain',
          },
        ],
      };

      const jsonldRequest = await deleteAction({
        telegram: this.chatData,
        creator: this.creator,
        publisher: this.publisher,
        silent,
      });
      await this.rpc(jsonldRequest);
    } else {
      const editAction = {
        '@context': 'http://schema.org',
        '@type': 'AllocateAction',
        'agent': {
          '@type': 'Person',
          'name': package_.name,
          'url': package_.homepage,
        },
        'name': 'EditMessage',
        'subjectOf': [
          {
            '@type': 'CreativeWork',
            'name': telegram_message_id,
            'dateModified': date,
            'abstract': text,
            'encodingFormat': 'text/plain',
            'creator': {
              '@type': 'Person',
              'knows': {
                '@type': 'Person',
                'name': telegram_user_id,
              },
            },
          },
        ],
      };

      // TODO: https://github.com/gotois/ProstoDiary_bot/issues/34
      const result = await editAction({
        telegram: this.chatData,
        creator: this.creator,
        publisher: this.publisher,
        silent,
      });
      await this.rpc(result);
    }
  }
}
/**
 * @description Обновление текста в БД или Удаление записи
 * @param {TelegramMessage} message - msg
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  message.text = message.text.trim();
  const editedMessageTextAPI = new EditMessageText(message);
  await editedMessageTextAPI.beginDialog(silent);
};
