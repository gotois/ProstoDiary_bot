import { linkStartApp } from '../../libs/tg-messages.ts';
import { secretaryGateway, userRepository } from '../../app/container.ts';

export default async (activity, message, bot) => {
  if (message.location) {
    console.log(message.location.latitude);
    console.log(message.location.longitude);
  }

  let results = [];
  if (message.query?.length) {
    try {
      const user = userRepository.findById(message.from?.id);
      const events = await secretaryGateway.queryEvents({
        query: message.query.trim(),
        limit: 5,
        accessToken: user.accessToken,
      });

      results = events.map((event) => {
        const taskId = event.id_task;
        const title = event.name;
        const description = [
          event.start_date ? new Date(String(event.start_date)).toLocaleString('ru-RU') : '',
          event.description,
        ]
          .filter(Boolean)
          .join(' · ');

        return {
          id: `event-${taskId}`,
          type: 'article',
          title,
          description,
          input_message_content: {
            message_text: title,
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Открыть',
                  url: linkStartApp({ to: `/calendar/${taskId}/view` }),
                },
              ],
            ],
          },
        };
      });
    } catch (error) {
      console.error('Unable to query inline events', error);
    }
  }

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
