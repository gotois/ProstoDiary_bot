const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');
const Abstract = require('vzor');

class Location extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const { latitude, longitude } = this.message.location;


    // fixme заполнять исходящий json-ld данными
     this.objectMainEntity = [];
        this.objectMainEntity.push({
            '@type': 'PropertyValue',
            'name': 'silent',
            'value': data.silent || false,
        });
        if (data.telegram) {
            if (data.telegram.messageId) {
                this.objectMainEntity.push({
                    '@type': 'PropertyValue',
                    'name': 'TelegramMessageId',
                    'value': data.telegram.messageId,
                });
            }
            if (data.telegram.chatId) {
                this.objectMainEntity.push({
                    '@type': 'PropertyValue',
                    'name': 'TelegramChatId',
                    'value': data.telegram.chatId,
                });

                // телеграм чат
                this.namespace = `https://t.me/chat#${data.telegram.chatId}`;
            }
        } else {
            // сообщение пришло из почты
            // this.namespace будет устанавливаться из Message-Id письма
        }
        

    const action = new Abstract({
      location: {
        latitude,
        longitude,
      },
    });



    const jsonldRequest = await action({
      latitude,
      longitude,
      date: this.message.date,
      creator: this.creator,
      publisher: this.publisher,
      telegram: this.chatData,
      silent,
    });
    await this.rpc(jsonldRequest);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const location = new Location(message);
  await location.beginDialog(silent);
};
