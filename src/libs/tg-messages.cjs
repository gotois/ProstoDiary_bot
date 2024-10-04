module.exports.sendCalendarMessage = async function (bot, message, output) {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
  const calendarMessage = await bot.sendMessage(message.chat.id, output, {
    reply_to_message_id: message.message_id,
    parse_mode: 'MarkdownV2',
    protect_content: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Скачать',
            callback_data: 'send_calendar',
          },
        ],
      ],
    },
  });
  try {
    await bot.pinChatMessage(message.chat.id, calendarMessage.message_id);
  } catch (error) {
    console.error(error);
  }
  return calendarMessage;
}

module.exports.sendTaskMessage = async function (bot, calendarMessage, task) {
  const taskMessage = await bot.sendMessage(calendarMessage.chat.id, task, {
    parse_mode: 'MarkdownV2',
    reply_to_message_id: calendarMessage.message_id,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Начать',
            callback_data: 'notify_calendar--start-pomodoro',
          },
        ],
        [
          {
            text: 'Позже',
            callback_data: 'notify_calendar--15',
          },
          {
            text: 'Напомнить через 1 час',
            callback_data: 'notify_calendar--60',
          },
          {
            text: 'Напомнить завтра',
            callback_data: 'notify_calendar--next-day',
          },
        ],
      ],
    },
  });
  return taskMessage;
}

module.exports.sendErrorMessage = async function (bot, message, error) {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '🤷‍♀', // 👾
      },
    ]),
  });
  return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
    disable_web_page_preview: true,
  });
}
