const fs = require('fs');
const pkg = require('../../package');
const bot = require('../core');
const sgMail = require('../services/sendgridmail.service');
const dbUsers = require('../database/users.database');
const logger = require('../services/logger.service');
const auth = require('../services/auth.service');
const BotStory = require('../models/story/bot-story');
const { PERSON } = require('../environment');
/**
 * @param {number} chatId - chatId
 * @returns {IterableIterator<*|void|PromiseLike<Promise | never>|Promise<Promise | never>|Promise>}
 */
function* messageIterator(chatId) {
  // Step 1: выводить оферту
  const offerta = fs.readFileSync('docs/_pages/offerta.md').toString();
  yield bot.sendMessage(chatId, offerta, {
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
    chatId,
    'Введите соль для шифрования\n' +
      '*Используйте специальные непечатные символы с помощью NumLock',
    {
      reply_markup: {
        force_reply: true,
      },
    },
  );
  // Step 3: генерируем Auth token
  const secret = auth.genereateGoogleAuth(PERSON.email);
  yield bot.sendMessage(
    chatId,
    `**Check your data:**\n\nAuth key: ${secret.base32}\nMail: ${PERSON.email}`,
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
  yield bot.sendMessage(chatId, 'Введите сгенерированный код из почты', {
    reply_markup: {
      force_reply: true,
    },
  });
  yield bot.sendMessage(
    chatId,
    `Привет __${PERSON.name}__!\nЯ твой бот __${pkg.description}__ ${pkg.version}!\nНе забудь настроить двухфакторную аутентификацию.`,
    {
      parse_mode: 'Markdown',
    },
  );
}
/**
 * При первом включении создаем в БД специальную колонку для работы
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @returns {undefined}
 */
const onStart = async ({ chat, from, date, message_id }) => {
  logger.log('info', onStart.name);
  const chatId = chat.id;
  const { rowCount } = await dbUsers.exist(from.id);
  // if (false) { // todo: test
  if (rowCount > 0) {
    await bot.sendMessage(chatId, 'Повторная установка не требуется');
    return;
  }
  // }
  // eslint-disable-next-line
  const messageListener = async (query) => {
    const installKey = '123456'; // todo сгенерированный ключ подтверждающий вход
    switch (query.data) {
      case 'CHECK': {
        await sgMail.send({
          to: PERSON.email,
          from: 'no-reply@gotointeractive.com',
          subject: 'ProstoDiary Auth👾',
          text:
            'Welcome to ProstoDiary.\nДля подтверждения пришлите боту сообщение' +
            installKey,
        });
        const checkMessageValue = await iterator.next().value;
        bot.onReplyToMessage(
          chatId,
          checkMessageValue.message_id,
          async ({ text }) => {
            if (text !== installKey) {
              // eslint-disable-next-line
              console.log('wrong key');
              return;
            }
            const story = new BotStory(
              Buffer.from(
                `INSTALL ${from.language_code} Bot for ${from.first_name}`,
              ),
              {
                date,
                type: 'CORE',
                intent: 'system',
                telegram_user_id: from.id,
                telegram_message_id: message_id,
              },
            );
            try {
              await story.save();
              iterator.next();
            } catch (error) {
              logger.log('error', error);
              await bot.sendMessage(chatId, 'Вход закончился ошибкой');
            } finally {
              bot.off('callback_query', messageListener);
            }
          },
        );
        break;
      }
      case 'CANCEL': {
        await bot.sendMessage(chatId, 'Please rerun /start');
        bot.off('callback_query', messageListener);
        break;
      }
      case 'AGREE': {
        const cryptoMessageValue = await iterator.next().value;
        bot.onReplyToMessage(
          chatId,
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
            iterator.next();
          },
        );
        break;
      }
      default: {
        break;
      }
    }
  };
  const iterator = messageIterator(chatId);
  await iterator.next();
  bot.on('callback_query', messageListener);
};

module.exports = onStart;
