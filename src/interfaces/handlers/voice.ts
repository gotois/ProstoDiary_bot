import { RECORD_AUDIO, parseMode, sendPrepareAction, sendPrepareMessage } from '../../libs/tg-messages.ts';
import { container } from '../../app/container.ts';

export default async (activity, message, bot) => {
  await sendPrepareAction(bot, message.chat.id, RECORD_AUDIO);

  const secretaryData = await container.processVoiceMessage.execute({
    fileId: message.voice.file_id,
    chatId: message.chat.id,
    tenantId: message.from.id,
    userId: message.user.sub,
    language: message.user.language,
    accessToken: message.user.access_token,
    location: message.user.location,
    timezone: message.user.timezone,
  });
  const { content, artifact } = secretaryData;

  const inlineKeyboard = [];
  await bot.sendMessage(message.chat.id, content[0].text, {
    parse_mode: parseMode('text/plain'),
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
  if (artifact) {
    await sendPrepareMessage(activity, message, bot);
  }
};
