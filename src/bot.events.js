const crypt = require('./crypt');
const fs = require('fs');
const zip = require('node-native-zip');
const commands = require('./bot.commands');
const bot = require('./bot.config');
const dbUsers = require('./database.users');
const dbEntries = require('./database.entries');
const format = require('./format');
const sessions = require('./sessions');
const datetime = require('./datetime');
const plot = require('./plotly.wrapper');

bot.onText(commands.DOWNLOAD, onDownload);
bot.onText(commands.DBCLEAR, onDBCLEAR);
bot.onText(commands.START, onStart);
bot.onText(commands.HELP, onHelp);
bot.onText(commands.GETDATE, getDataFromDate);
bot.onText(commands.SETDATE, setDataFromDate);
bot.onText(commands.GRAPH, getGraph);
bot.on('edited_message_text', onEditedMessageText);
bot.on('text', onText);
/***
 * Получить все что я делал в эту дату
 * @example /get 26.11.2016
 * @param msg {Object}
 * @param match {Array}
 * @return {void}
 */
function getDataFromDate(msg, match) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const date = datetime.convertToNormalDate(match[1]);
  if (!datetime.isNormalDate(date)) {
    bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(userId);
  dbEntries.get(currentUser.id, match[1]).then(data => {
    const rows = data.rows.map(row => crypt.decode(row.entry));
    if (rows.length) {
      bot.sendMessage(chatId, JSON.stringify(rows, null, 2));
    } else {
      bot.sendMessage(chatId, 'Записей нет');
    }
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, 'Произошла ошибка');
  });
}
/***
 * Установить что я делал в какой-то день:
 * /set 26.11.2016 something text
 * @param msg {Object}
 * @param match {Array}
 * @return {void}
 */
function setDataFromDate(msg, match) {
  const chatId = msg.chat.id;
  const input = msg.text.replace(commands.SETDATE, '').trim();
  const date = datetime.convertToNormalDate(match[1]);
  if (!datetime.isNormalDate(date)) {
    bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(msg.from.id);
  dbEntries.post(currentUser.id, crypt.encode(input), msg.message_id, new Date(), match[1]).then(() => {
    const text = prevInput(input);
    bot.sendMessage(chatId, text);
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, 'Произошла ошибка');
  });
}
/***
 * Скачивание файла БД на устройство
 * @param msg {Object}
 * @return {void}
 */
function onDownload(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const fileName = `prosto-diary-backup-${msg.date}.txt`;
  const archive = new zip();
  const currentUser = sessions.getSession(fromId);
  dbEntries.getAll(currentUser.id).then(data => {
    if (data.rows.length > 0) {
      const formatData = format.formatRows(data.rows);
      archive.add(fileName, new Buffer(formatData, 'utf8'));
      const buffer = archive.toBuffer();
      bot.sendDocument(chatId, buffer);
    } else {
      bot.sendMessage(chatId, 'Нет данных');
    }
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, 'Операция не выполнена');
  });
}
/***
 * Очистить базу данных с подтверждением
 * @param msg {Object}
 * @return {void}
 */
function onDBCLEAR(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const options = {
    reply_markup: {
      'force_reply': true
    }
  };
  const currentUser = sessions.getSession(fromId);
  bot.sendMessage(chatId, 'Очистить ваши записи? (Y/N)', options).then(sended => {
    const senderId = sended.chat.id;
    const messageId = sended.message_id;
    bot.onReplyToMessage(senderId, messageId, message => {
      if (message.text.toUpperCase() === 'Y') {
        dbEntries.clear(currentUser.id).then(() => {
          bot.sendMessage(senderId, 'Данные очищены');
        }).catch(error => {
          console.error(error);
          bot.sendMessage(senderId, 'Ошибка в операции');
        });
      } else {
        bot.sendMessage(senderId, 'Операция не выполнена');
      }
    });
  });
}
/***
 * При первом включении создаем в БД специальную колонку для работы
 * @param msg {Object}
 * @return {void}
 */
function onStart(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const currentUser = sessions.getSession(fromId);
  dbUsers.check(currentUser.id).then(value => {
    if (value.rowCount === 0) {
      return dbUsers.post(currentUser.id).then(() => {
        bot.sendMessage(chatId, 'Вы вошли в систему');
      });
    } else {
      bot.sendMessage(chatId, 'Повторный вход не требуется');
    }
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, 'Операция не выполнена');
  });
}
/***
 *
 * @param msg {Object}
 * @return {void}
 */
function onHelp(msg) {
  const data = {
    '/download': 'Загрузка файла с данными',
    '/dbclear': 'Удаление БД',
    '/graph': 'Построение графиков',
    '/get 1.12.2016': 'Получение данных за этот срок',
    '/set 31.01.2016': 'Добавление данных за этот срок',
  };
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, JSON.stringify(data, null, 2));
}
/***
 * текст редактируется он обновляет свое значение в БД.
 * @param msg {Object}
 * @return {void}
 */
function onEditedMessageText(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const input = msg.text.trim();
  if (input.startsWith('/')) {
    bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  if (input === 'del') {
    dbEntries.delete(currentUser.id, msg.message_id).then(() => {
      bot.sendMessage(chatId, 'Запись удалена');
    }).catch(error => {
      console.error(error);
      bot.sendMessage(chatId, error.toLocaleString());
    });
    return;
  }
  dbEntries.put(currentUser.id, crypt.encode(input), new Date(), msg.message_id).then(() => {
    bot.sendMessage(chatId, prevInput(input) + 'Запись обновлена');
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, error.toLocaleString());
  });
}
/***
 * Все что пишешь - записывается в сегодняшний день
 * @param msg {Object}
 * @return {void}
 */
function onText(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const input = msg.text.trim();
  // Пропускаем Reply сообщений
  if (msg.reply_to_message instanceof Object) {
    return;
  }
  // Пропускаем зарезервированные команды
  for (const command of Object.keys(commands)) {
    if (input.search(commands[command]) >= 0) {
      return;
    }
  }
  if (input.startsWith('/')) {
    bot.sendMessage(chatId, 'Такой комманды нет. Нажмите /help для помощи');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  dbEntries.post(currentUser.id, crypt.encode(input), msg.message_id, new Date(msg.date * 1000)).then(() => {
    const text = prevInput(input);
    bot.sendMessage(chatId, text);
  }).catch(error => {
    bot.sendMessage(chatId, error);
  });
}
/**
 *
 * @param msg {Object}
 * @return {void}
 */
function getGraph(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const currentUser = sessions.getSession(fromId);
  const input = msg.text.replace(commands.GRAPH, '').trim();
  dbEntries.getAll(currentUser.id).then(data => {
    if (data.rows.length <= 0) {
      throw 'Null rows exception';
    }
    // временная шкала х {String} и частота y {Number}
    const trace = {
      x: [],
      y: []
    };
    data.rows.map(row => {
      const entry = crypt.decode(row.entry);
      return {
        date_added: row.date_added,
        entry
      };
    }).filter(text => {
      return text.entry.includes(input);
    }).forEach(row => {
      const x = row.date_added.toLocaleDateString();
      const y = 1;
      const xIndex = trace.x.findIndex(_x => _x === x);
      if (xIndex < 0) {
        trace.x.push(x);
        trace.y.push(y);
      } else {
        ++trace.y[xIndex];
      }
    });
    if (!trace.x.length) {
      throw 'Нет данных для построения графика';
    }
    return trace;
  }).then(trace => {
    trace.type = 'bar';
    const figure = {'data': [trace]};
    const imgOpts = {
      format: 'png',
      width: 512,
      height: 384
    };
    return plot.getImageBuffer(figure, imgOpts);
  }).then(photoBuffer => {
    return bot.sendPhoto(chatId, photoBuffer, {
      caption: `График для /${input}/`
    });
  })/*.then(() => {
   // TODO: использовать если потребуется удаление графиков
   return plot.deletePlot('0');
   })*/.catch((error) => {
    console.error(error);
    switch (typeof error) {
      case 'string': {
        bot.sendMessage(chatId, error);
        break;
      }
      case 'object': {
        if (error.statusMessage !== 'NOT FOUND') {
          bot.sendMessage(chatId, 'Произошла ошибка при удалении графика с сервера');
        }
        break;
      }
    }
  });
}
/***
 * Message updated
 * @param input {String}
 * @returns {string}
 */
function prevInput(input) {
  return '✓' + input.replace(/\n/g, ' ').substring(0, 6) + '…';
}
