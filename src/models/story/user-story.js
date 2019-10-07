const Story = require('./');
const dbEntries = require('../../database/entities.database');

class UserStory extends Story {
  constructor(abstract) {
    super(abstract);
  }
  toJSON() {
    return {
      ...super.toJSON(),
      telegram_user_id: this.telegram_user_id,
      telegram_message_id: this.telegram_message_id,
      // todo: сюда же добавляется subject из письма
      // todo: сюда же добавляется raw - ссылка на исходик (в письме аттача или типо того)
      // todo: канонический урл - url
      // todo: bot blockchain sign
    }
  }
  /**
   * @returns {undefined}
   */
  async update () {
    // todo: учитывая что используется стандарт почты - нужно кидать новое письмо
    await dbEntries.put(this.toJSON());
  }
  /**
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/98
   * @returns {undefined}
   */
  async save () {
    await dbEntries.post(this.toJSON());
  }
}

module.exports = UserStory;
