import { linkStartApp } from '../../libs/tg-messages.ts';

export default (activity, message, bot) => {
  if (message.location) {
    console.log(message.location.latitude);
    console.log(message.location.longitude);
  }

  const results = [
    /*
    todo: поддержать поиск по событиям в группе используя автодополнение
    {
      id: 'search-event',
      type: 'article',
      title: 'Какое-то событие',
      description: 'Созданное событие в календаре',
      input_message_content: {
        message_text: 'Событие 1',
      },
    },*/
  ];

  return bot.answerInlineQuery(message.id, results, {
    is_personal: true,
    cache_time: 10,
    button: {
      text: 'Создать событие',
      web_app: {
        url: linkStartApp({ to: '/calendar/new' }),
      },
    },
  });
};
