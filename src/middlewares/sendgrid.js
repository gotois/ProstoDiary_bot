module.exports = async (request, response) => {
  for (const info of request.body) {
    switch (info.event) {
      case 'processed': {
        console.log(info)

        const mailMap = await VzorService.search(['ALL', ['HEADER', 'MESSAGE-ID', info['smtp-id']]]);
        for (const [_mapId, mail] of mailMap) {
          // в зависимости от полученной категории выполняем разные действия
          if (info.category.includes('transaction')) {
            await mailService.read(mail);
          }
          console.log(mail)
        }
        // for update message
        if (!info.test && info.chat_id && info.telegram_message_id) {
          await bot.editMessageText('✅', {
            chat_id: info.chat_id,
            message_id: info.telegram_message_id,
          });
        }
        break;
      }
      case 'delivered': {
        break;
      }
      default: {
        break;
      }
    }
  }
  response.sendStatus(200);
};
