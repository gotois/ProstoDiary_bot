const jsonrpc = require('jsonrpc-lite');
const fs = require('fs');
const cryptoRandomString = require('crypto-random-string');
const pkg = require('../../package');
const bot = require('../core/bot');
const sgMail = require('../services/sendgridmail.service');
const dbUsers = require('../database/users.database');
const logger = require('../services/logger.service');
const auth = require('../services/auth.service');
const { PERSON } = require('../environment');
const APIPost = require('../api/v2/post');

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
    // todo проверять text, валидировать его json, проверять типы и пр
    //  ...
    this.creator = await PERSON; // пока вместо текст используем env

    // todo добавить специальные непечатные символы с помощью NumLock', а также эмоджи
    // fixme сохранять мастер соль
    // const masterSalt = cryptoRandomString({ length: 10 });

    const script = `INSERT INTO creator (telegramUserId, id, name, email, image, url, sameAs) VALUES (${
      this.message.from.id
    }, '${this.creator['@id']}', '${this.creator.name}', '${
      this.creator.email
    }', '${this.creator.image}', '${this.creator.url}', array${JSON.stringify(
      this.creator.sameAs,
    ).replace(/"/g, '\'')}) ;`; // eslint-disable-line
    const requestObject = jsonrpc.request('123', 'script', {
      buffer: Buffer.from(script),
      date: this.message.date,
      mime: 'application/sql',
      creator: this.creator.email,
      publisher: pkg.author.email,
      telegram_message_id: this.message.message_id,
    });
    const result = await APIPost(requestObject);
    if (result.error) {
      console.error(result.error); // eslint-disable-line
      await bot.sendMessage(
        this.message.chat.id,
        'Сгенерирована ошибка скрипта. Попробуйте сначала',
      );
      bot.off('callback_query', this.messageListener);
      return;
    }
    this.dialog.next();
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
      creator: pkg.author.email,
      publisher: pkg.author.email,
      telegram_message_id: this.message.message_id,
    });
    const result = await APIPost(requestObject);
    if (result.error) {
      bot.off('callback_query', this.messageListener);
      await bot.sendMessage(
        this.message.chat.id,
        'Вход закончился ошибкой. Попробуйте снова /start',
      );
      return;
    }
    this.dialog.next();
  }
  async messageListener(query) {
    switch (query.data) {
      case 'CHECK': {
        this.installKey = cryptoRandomString({ length: 5, type: 'url-safe' });
        await sgMail.send({
          to: this.creator.email,
          from: pkg.author.email,
          subject: 'ProstoDiary Auth👾',
          text:
            'Welcome to ProstoDiary. ' +
            'Для подтверждения пришлите боту сообщение: ' +
            this.installKey,
        });
        const checkMessageValue = await this.dialog.next().value;
        bot.onReplyToMessage(
          this.message.chat.id,
          checkMessageValue.message_id,
          this.checkReplyMessage.bind(this),
        );
        break;
      }
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
            { text: 'Не принимаю', callback_data: 'CANCEL' },
          ],
        ],
      },
    });
    // Step 2: получать JSON-LD, например - https://me.baskovsky.ru
    yield bot.sendMessage(
      this.message.chat.id,
      'Введите ссылку вашего сайта\n' +
        '*На сайте необходимы данные Person JSON-LD*',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    // Step 3: генерируем Auth token
    const secret = auth.genereateGoogleAuth(this.creator.email);
    yield bot.sendMessage(
      this.message.chat.id,
      '**Check your data:**\n\n' +
        `Auth key: ${secret.base32}\n` +
        `Mail: ${this.creator.email}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [
              { text: 'OK', callback_data: 'CHECK' },
              { text: 'CANCEL', callback_data: 'CANCEL' },
            ],
          ],
        },
      },
    );
    yield bot.sendMessage(
      this.message.chat.id,
      'Введите сгенерированный код из почты',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    yield bot.sendMessage(
      this.message.chat.id,
      `Привет __${this.creator.name}__!\n
      Я твой бот __${pkg.description}__ ${pkg.version}!\n
      Не забудь бэкапить двухфакторную аутентификацию.`,
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
