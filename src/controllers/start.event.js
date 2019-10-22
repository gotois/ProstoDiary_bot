const jsonrpc = require('jsonrpc-lite');
const fs = require('fs');
const cryptoRandomString = require('crypto-random-string');
const pkg = require('../../package');
const bot = require('../core/bot');
const sgMail = require('../services/sendgridmail.service');
const dbUsers = require('../database/users.database');
const logger = require('../services/logger.service');
const auth = require('../services/auth.service');
const APIPost = require('../api/v2/post');
const jsonldModel = require('../models/jsonld');

class Start {
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message) {
    this.message = message;
    this.dialog = this.messageIterator();
    this.messageListener = this.messageListener.bind(this);
    bot.on('callback_query', this.messageListener);
  }
  async beginDialog() {
    logger.log('info', Start.name);
    // if (false) { // todo: test
    const { rowCount } = await dbUsers.exist(this.message.from.id);
    if (rowCount > 0) {
      await bot.sendMessage(
        this.message.chat.id,
        'Повторная установка не требуется',
      );
      return;
    }
    // } // testend
    await this.dialog.next();
  }
  async agreeReplyMessage({ text }) {// eslint-disable-line
    try {
      this.user = await jsonldModel.save(text);
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(
        this.message.chat.id,
        'Сгенерирована ошибка записи JSON-LD. Проверьте правильность ввода и начните сначала /start',
      );
      bot.off('callback_query', this.messageListener);
      return;
    }
    this.installKey = cryptoRandomString({ length: 5, type: 'url-safe' });
    // генерируем Auth token
    const secret = auth.genereateGoogleAuth(this.user.email);
    await sgMail.send({
      to: this.user.email,
      from: pkg.author.email,
      subject: 'Welcome to ProstoDiary',
      html: `
        <h1>Добро пожаловать в ProstoDiary</h1>
        <p>Для подтверждения работы пришлите ProstoDiary_bot сообщение: <strong>${this.installKey}</strong></p>
        <br>
        <p>Не забудьте сохранить данные этого письма и настроить двухфакторную аутентификацию!<p>
        <p>Ваш секретный ключ для двухфакторной аутентификации: <strong>${secret.base32}</strong></p>
      `, // todo: и сгенерированный openpgp ключ
    });
    const checkCodeMessageValue = await bot.sendMessage(
      this.message.chat.id,
      'Введите сгенерированный код из почты',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    bot.onReplyToMessage(
      this.message.chat.id,
      checkCodeMessageValue.message_id,
      this.checkReplyMessage.bind(this),
    );
  }
  async checkReplyMessage({ text }) {
    if (text !== this.installKey) {
      // todo доделать функционал ограниченности попыток - 3 штуки макс
      await bot.sendMessage(this.message.chat.id, 'Неверный ключ');
      return;
    }
    const requestObject = jsonrpc.request('123', 'post', {
      buffer: Buffer.from(
        `Установка ${pkg.name} ${this.message.from.language_code} для ${this.message.from.first_name}`,
      ),
      mime: 'plain/text',
      date: this.message.date,
      creator: this.user.email,
      publisher: pkg.author.email,
      telegram_message_id: this.message.message_id,
    });
    const result = await APIPost(requestObject);
    if (result.error) {
      bot.off('callback_query', this.messageListener);
      await bot.sendMessage(
        this.message.chat.id,
        `Вход закончился ошибкой ${result.error}. Попробуйте снова /start`,
      );
      return;
    }
    this.dialog.next();
  }
  async messageListener(query) {
    switch (query.data) {
      case 'CANCEL': {
        await bot.sendMessage(this.message.chat.id, 'Please rerun /start');
        bot.off('callback_query', this.messageListener);
        break;
      }
      case 'AGREE': {
        const jsonLDMessageValue = await this.dialog.next().value;
        bot.onReplyToMessage(
          this.message.chat.id,
          jsonLDMessageValue.message_id,
          this.agreeReplyMessage.bind(this),
        );
        break;
      }
      default: {
        break;
      }
    }
  }
  /**
   * @returns {IterableIterator<*|void|PromiseLike<Promise | never>|Promise<Promise | never>|Promise>}
   */
  *messageIterator() {
    // Step 1: выводить оферту
    const offerta = fs.readFileSync('docs/_pages/offerta.md').toString();
    yield bot.sendMessage(this.message.chat.id, offerta, {
      parse_mode: 'Markdown',
      reply_markup: {
        force_reply: true,
        inline_keyboard: [
          [
            { text: 'Принимаю', callback_data: 'AGREE' },
            { text: 'Отмена', callback_data: 'CANCEL' },
          ],
        ],
      },
    });
    // Step 2: получать JSON-LD, например - https://me.baskovsky.ru
    yield bot.sendMessage(
      this.message.chat.id,
      'Введите данные вашего JSON-LD\n**Website or JSON**',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
        },
      },
    );
    yield bot.sendMessage(
      this.message.chat.id,
      `Привет __${this.user.name}__!\n
      Я твой бот __${pkg.description}__ ${pkg.version}!`,
      {
        parse_mode: 'Markdown',
      },
    );
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {undefined}
 */
const onStart = async (message) => {
  const start = new Start(message);
  await start.beginDialog();
};

module.exports = onStart;
