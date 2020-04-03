const { pool } = require('../../db/sql');
const passportQueries = require('../../db/passport');

const store = new Map();

class Account {
  constructor(id) {
    this.accountId = id;
    store.set(this.accountId, this);
  }
  // todo использовать scope и use для выборки
  async claims(/* use, scope */) {
    const botInfo = await pool.connect(async (connection) => {
      const botTable = await connection.one(
        passportQueries.selectBotById(this.accountId),
      );
      return botTable;
    });

    return {
      sub: this.accountId, // it is essential to always return a sub claim
      email: botInfo.email, // почта бота
      email_verified: botInfo.activated,
      client_id: botInfo.telegram_chat_id,
      updated_at: botInfo.updated_at,
    };
  }
  /**
   * Получение аккаунта и запись в стор
   *
   * @todo надо переделать под выборку через redis
   * @param {*} context - context
   * @param {*} id - id
   * @returns {Promise<any>}
   */
  static findAccount(context, id) {
    return new Promise((resolve) => {
      // token is a reference to the token used for which a given account is being loaded,
      //  it is undefined in scenarios where account claims are returned from authorization endpoint
      if (!store.get(id)) {
        new Account(id);
      }
      const out = store.get(id);
      resolve(out);
    });
  }
}

module.exports = Account;
