const TelegramBotRequest = require('./telegram-bot-request');
const { pool, sql } = require('../../../db/sql');
const assistantChatQueries = require('../../../db/selectors/chat');
const logger = require('../../../lib/log');

class NewChatMembers extends TelegramBotRequest {
  async beginDialog(silent) {
    await super.beginDialog(silent);

    const newMember =
      this.message.new_chat_participant || this.message.new_chat_member;
    if (!newMember.is_bot) {
      logger.warn('SKIP: new member is not a bot');
      return;
    }
    logger.info(newMember);
    await pool.connect(async (connection) => {
      const assistantBot = await connection.one(
        sql`select * from assistant.chat where id = ${this.message.from.id}`,
      );
      if (!assistantBot) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Добавлять бота может только участник создавший с ассистентом личный чат',
        );
      }
      await connection.query(
        assistantChatQueries.createChat({
          id: String(this.message.chat.id),
          name: this.message.chat.title,
          assistant_bot_id: assistantBot.assistant_bot_id,
        }),
      );
    });
    logger.info('new assistant chat created');

    const me = await this.bot.getMe();
    await this.bot.sendMessage(
      this.message.chat.id,
      `Hello. I am ${me.first_name}`,
    );
  }
}
/**
 * @description Добавление нового участника в чат
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const newChatMembers = new NewChatMembers(message);
  await newChatMembers.beginDialog(silent);
};
