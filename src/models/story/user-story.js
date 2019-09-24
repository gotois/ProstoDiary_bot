const Story = require('./');
const dbEntries = require('../../database/entities.database');

class UserStory extends Story {
  #publisher = '';
  
  constructor(params) {
    super(params);
  }
  get publisher() {
    return this.#publisher;
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
