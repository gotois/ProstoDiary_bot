const logger = require('../../services/logger.service');
const crypt = require('../../services/crypt.service');
/**
 * @param {string} subject
 */
const analyzeSubject = (subject) => {
  console.log('subject', subject);
  // todo сверяем subject с установленными правилами и на основе их пересечения бот будет совершать то или иное действие
};
/**
 * Анализируем сообщение и выявляем абстракты
 *
 * @param {*} content - content
 * @param contentType
 * @returns JSON-LD
 */
const analyzeContent = (content, contentType) => {
  console.log(content);
  const abstracts = [];
  switch (contentType) {
    case 'text/html': {
      // todo нужно разбирать адреса и прочее из html текта
      break;
    }
    case 'plain/text': {
      //     abstracts.push(new AbstractText(content, contentType));
      break;
    }
    case 'image/png':
    case 'image/jpeg': {
      //     abstracts.push(new AbstractPhoto(content, contentType));
      break;
    }
    case 'application/pdf':
    case 'application/xml': {
      //     abstracts.push(new AbstractDocument(content, contentType));
      break;
    }
    case 'application/zip':
    case 'multipart/x-zip': {
      //     for await (const [_fileName, zipBuffer] of unpack(content)) {
      //       abstracts.push(new AbstractDocument(zipBuffer, contentType));
      //     }
      break;
    }
    case 'application/octet-stream': {
      //     abstracts.push(new AbstractText(content, contentType));
      break;
    }
    default: {
      // todo: нужен разбор html и text из письма
      logger.warn('info', 'Unknown mime type ' + contentType);
    }
  }
};
/**
 * @description Чтение письма и запись в БД - Полный разбор и получение из всего этого storyJSON
 * @param {object} parameters - jsonrpc parameters
 * @param {?object} basic - basic auth
 * @returns {Promise<string>}
 */
module.exports = async (parameters, basic) => {
  const { mail, secret_key } = parameters;
  const {
    from,
    messageId,
    to,
    date,
    contentType,
    uid,
    headers,
    subject,
    attachments,
  } = mail;
  // todo Валидация письма
  //  ...
  // const story = new Story(mail);
  // имя бота с которого было отправлено письмо. пока верим всем ботам с таким хедером
  if (headers['x-bot']) {
    // todo Разбор subject
    //  ...
    if (attachments) {
      for (const attachment of attachments) {
        // todo Расшифровка контента
        //  ...
        const {
          content,
          contentType,
          transferEncoding,
          // generatedFileName,
          // contentId,
          // checksum,
          // length,
          // contentDisposition,
          // fileName,
        } = attachment;
        // if (transferEncoding !== 'base64' || transferEncoding !== 'quoted-printable) {
        //   continue;
        // }
        const decryptMessage = await crypt.openpgpDecrypt(content, [
          secret_key,
        ]);
        const abstracts = await analyzeContent(decryptMessage, contentType);
        // await story.append(abstracts);
      }
    }
  } else if (mail.from[0].address === 'xxx@ya.ru') {
    // todo если прислал пользователь бота - тогда в приоритете разбираем и делаем что написано.
    analyzeSubject(mail.subject);
    const abstracts = await analyzeContent(
      mail.html,
      mail.headers['content-type'],
    );
    // await story.append(abstracts);
  } else {
    // Иначе сразу удаляем
  }
  // todo Сохранение в БД
  //  ...
  // await story.commit();
  // return 'Сообщение успешно проанализировано';
};
