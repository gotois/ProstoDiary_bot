export default async (activity, message, bot) => {
  console.log('contact', activity);
  await bot.sendMessage(message.chat.id, 'Contact: ' + JSON.stringify(activity.object), {
    parse_mode: 'MarkdownV2',
  });
};
