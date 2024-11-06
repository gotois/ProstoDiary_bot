const { sendPrepareAction } = require('./tg-prepare-action.cjs');
const { TEXT_CALENDAR } = require('../libs/mime-types.cjs');
const { serializeMarkdownV2 } = require('../libs/md-serialize.cjs');

const keyboardStart = (url) => {
  const keyboard = {
    text: 'Начать',
    callback_data: 'notify_calendar--start-pomodoro',
  };
  if (url) {
    keyboard.url = url;
  }
  return keyboard;
};
const keyboardLater = () => {
  const keyboard = {
    text: 'Позже',
    callback_data: 'notify_calendar--15',
  };
  return keyboard;
};
const keyboardLater60 = () => {
  const keyboard = {
    text: 'Напомнить через 1 час',
    callback_data: 'notify_calendar--60',
  };
  return keyboard;
};
const keyboardLaterTomorrow = () => {
  const keyboard = {
    text: 'Напомнить завтра',
    callback_data: 'notify_calendar--next-day',
  };
  return keyboard;
};

module.exports.sendPrepareCalendar = async function (bot, message) {
  await bot.sendChatAction(message.chat.id, sendPrepareAction(TEXT_CALENDAR));
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
};

module.exports.sendCalendarMessage = async function (bot, message, output, googleCalendarUrl) {
  const keyboardDownloadCalendar = {
    text: 'Скачать',
    callback_data: 'send_calendar',
  };
  const keyboardGoogleCalendar = {
    text: 'В Google Calendar',
    url: googleCalendarUrl,
  };
  const calendarMessage = await bot.sendMessage(message.chat.id, output, {
    reply_to_message_id: message.message_id,
    parse_mode: 'MarkdownV2',
    protect_content: true,
    reply_markup: {
      inline_keyboard: [[keyboardDownloadCalendar, keyboardGoogleCalendar]],
    },
  });
  try {
    await bot.pinChatMessage(message.chat.id, calendarMessage.message_id);
  } catch (error) {
    console.error(error);
  }
  return calendarMessage;
};

module.exports.sendTaskMessage = async function (bot, calendarMessage, task, url) {
  await bot.unpinChatMessage(calendarMessage.chat.id, {});
  const editMessage = await bot.editMessageText(task, {
    chat_id: calendarMessage.chat.id,
    message_id: calendarMessage.message_id,
    parse_mode: 'MarkdownV2',
    protect_content: true,
    reply_markup: {
      inline_keyboard: [[keyboardStart(url)]],
    },
  });
  const taskMessage = await bot.sendMessage(calendarMessage.chat.id, serializeMarkdownV2(task), {
    parse_mode: 'MarkdownV2',
    reply_to_message_id: calendarMessage.message_id,
    reply_markup: {
      inline_keyboard: [[keyboardStart(url)], [keyboardLater(), keyboardLater60(), keyboardLaterTomorrow()]],
    },
  });
  await bot.pinChatMessage(calendarMessage.chat.id, editMessage.message_id);
  return taskMessage;
};

module.exports.sendErrorMessage = async function (bot, message, error) {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '🤷‍♀', // 👾
      },
    ]),
  });
  switch (error.message) {
    case 'Unauthorized': {
      return bot.sendMessage(message.chat.id, 'Требуется авторизация /start', {
        disable_web_page_preview: true,
      });
    }
    case 'Bad Request': {
      return bot.sendMessage(
        message.chat.id,
        'Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.',
        {
          disable_web_page_preview: true,
        },
      );
    }
    default: {
      return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
        disable_web_page_preview: true,
      });
    }
  }
};
