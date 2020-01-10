const bot = require('../../core/bot');
const package_ = require('../../../package');
const TelegramBotRequest = require('./telegram-bot-request');
const AbstractGeo = require('../../models/abstract/abstract-geo');

class Location extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const { latitude, longitude } = this.message.location;
    const locationGeo = new AbstractGeo({ latitude, longitude });
    const locationGeoJSON = await locationGeo.commit();
    const result = await this.request('post', {
      text: JSON.stringify(locationGeoJSON.geo), // todo это поле уже не используется
      mime: 'application/vnd.geo+json',
      date: this.message.date,
      from: {
        email: package_.author.email,
        name: this.message.passport.id,
      },
      to: [
        {
          email: this.message.passport.botEmail,
          name: this.message.passport.botId,
        },
      ],
      telegram_message_id: this.message.message_id,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const location = new Location(message);
  await location.beginDialog();
};
