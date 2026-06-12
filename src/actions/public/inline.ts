/* eslint-disable require-await */

// пример запроса:
// @secretary_dev_bot какие сегодня встречи?

export default async (activity, message, bot) => {
  console.log('WIP inline action', message);
  if (message.location) {
    console.log(message.location.latitude);
    console.log(message.location.longitude);
  }

  // Todo использовать автодополнение
  // const suggestionElement = new Set();
  const results = [
    {
      id: result.id,
      type: 'article',
      title: result.title,
      description: result.details,
      thumbnail_url: '',
      input_message_content: { message_text: 'article 1' },
    },
  ];

  console.log('results', results);

  return bot.answerInlineQuery(message.id, results, {
    is_personal: true,
    cache_time: 10,
  });
};
