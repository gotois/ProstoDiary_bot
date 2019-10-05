const fs = require('fs');
const pkg = require('../../package');
const bot = require('../core/bot');
const sgMail = require('../services/sendgridmail.service');
const dbUsers = require('../database/users.database');
const logger = require('../services/logger.service');
const auth = require('../services/auth.service');
const BotStory = require('../models/story/bot-story');
const { PERSON } = require('../environment');

class Start {
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message, personData) {
    this.message = message;
    this.personData = personData;
    this.dialog = this.messageIterator();
    this.messageListener = this.messageListener.bind(this);
    bot.on('callback_query', this.messageListener);
  }
  async beginDialog() {
    // if (false) { // todo: test
    const { rowCount } = await dbUsers.exist(this.message.from.id);
    if (rowCount > 0) {
      await bot.sendMessage(
        this.message.chat.id,
        'Повторная установка не требуется',
      );
      return;
    }
    // }
    await this.dialog.next();
  }
  async messageListener(query) {
    const installKey = '123456'; // todo сгенерированный ключ подтверждающий вход
    switch (query.data) {
      case 'CHECK': {
        await sgMail.send({
          to: this.personData.email,
          from: 'no-reply@gotointeractive.com',
          subject: 'ProstoDiary Auth👾',
          text:
            'Welcome to ProstoDiary.\nДля подтверждения пришлите боту сообщение' +
            installKey,
        });
        const checkMessageValue = await this.dialog.next().value;
        bot.onReplyToMessage(
          this.message.chat.id,
          checkMessageValue.message_id,
          async ({ text }) => {
            if (text !== installKey) {
              // todo доделать функционал ограниченности попыток
              await bot.sendMessage(
                this.message.chat.id,
                'Неверный ключ, осталось попыток: 3',
              );
              return;
            }
            const story = new BotStory(
              Buffer.from(
                `INSTALL ${this.message.from.language_code} Bot for ${this.message.from.first_name}`,
              ),
              {
                date: this.message.date,
                type: 'CORE',
                intent: 'system',
                telegram_user_id: this.message.from.id,
                telegram_message_id: this.message.message_id,
              },
            );
            try {
              await story.save();
              this.dialog.next();
            } catch (error) {
              logger.log('error', error);
              await bot.sendMessage(
                this.message.chat.id,
                'Вход закончился ошибкой',
              );
            } finally {
              bot.off('callback_query', this.messageListener);
            }
          },
        );
        break;
      }
      case 'CANCEL': {
        await bot.sendMessage(this.message.chat.id, 'Please rerun /start');
        bot.off('callback_query', this.messageListener);
        break;
      }
      case 'AGREE': {
        const cryptoMessageValue = await this.dialog.next().value;
        bot.onReplyToMessage(
          this.message.chat.id,
          cryptoMessageValue.message_id,
          // eslint-disable-next-line
          async ({ text }) => {
            // todo: сохранять в БД соль для crypto
            // eslint-disable-next-line
            console.log('your salt', text);
            // secret.base32 // todo: это нужно сохранять в БД
            // new Story({
            //   intent: 'system',
            //   type: 'CORE',
            // })
            this.dialog.next();
          },
        );
        break;
      }
      default: {
        break;
      }
    }
  }
  /**
   * @param {jsonld} personData - personData
   * @returns {IterableIterator<*|void|PromiseLike<Promise | never>|Promise<Promise | never>|Promise>}
   */
  *messageIterator(personData) {
    // Step 1: выводить оферту
    const offerta = fs.readFileSync('docs/_pages/offerta.md').toString();
    yield bot.sendMessage(this.message.chat.id, offerta, {
      parse_mode: 'Markdown',
      reply_markup: {
        force_reply: true,
        inline_keyboard: [
          [{ text: 'Принимаю', callback_data: 'AGREE' }],
          [{ text: 'Не принимаю', callback_data: 'CANCEL' }],
        ],
      },
    });
    // Step 2: получать соль
    yield bot.sendMessage(
      this.message.chat.id,
      'Введите соль для шифрования\n' +
        '*Используйте специальные непечатные символы с помощью NumLock',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    // Step 3: генерируем Auth token
    const secret = auth.genereateGoogleAuth(this.personData.email);
    yield bot.sendMessage(
      this.message.chat.id,
      `**Check your data:**\n\nAuth key: ${secret.base32}\nMail: ${this.personData.email}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [{ text: 'OK', callback_data: 'CHECK' }],
            [{ text: 'CANCEL', callback_data: 'CANCEL' }],
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
      `Привет __${this.personData.name}__!\nЯ твой бот __${pkg.description}__ ${pkg.version}!\nНе забудь настроить двухфакторную аутентификацию.`,
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
  logger.log('info', onStart.name);
  const personData = await PERSON;
  const start = new Start(message, personData);
  await start.beginDialog(personData);
};

module.exports = onStart;
