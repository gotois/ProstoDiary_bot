const { simpleParser } = require('mailparser');

module.exports.readMailStream = function (stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      simpleParser(Buffer.concat(chunks).toString('utf8'), (error, mail) => {
        if (error) {
          return reject(error);
        }
        resolve(mail);
      });
    });
  });
};

/**
 * @see https://nodemailer.com/message/
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения ботом удаляем
 * @param {object} requestObject - message
 * @returns {Promise<string>}
 */
module.exports.mailObject = function (requestObject) {
  return {
    from: requestObject.from, // sender address
    // cc: cc,
    // bcc: bcc,
    to: requestObject.personalizations[0].to, // list of receivers
    subject: requestObject.personalizations[0].subject, // Subject line
    text: requestObject.text, // plain text body
    html: requestObject.html, // html body

    attachments: requestObject.attachments,

    replyTo: requestObject.replyTo, // An email address that will appear on the Reply-To: field
    // sender, //- An email address that will appear on the Sender: field (always prefer from if you’re not sure which one to use)
    // inReplyTo, // The Message-ID this message is replying to
    // references, // Message-ID list (an array or space separated string)
    // envelope, // optional SMTP envelope, if auto generated envelope is not suitable (see SMTP envelope for details)

    icalEvent: {
      filename: 'invitation.ics',
      method: 'request',
      // fixme
      content: `
      BEGIN:VCALENDAR\r\nPRODID:-//ACME/DesktopCalendar//EN\r\nMETHOD:REQUEST\r\n...`,
    },

    priority: 'normal',
    headers: requestObject.personalizations[0].headers,
    date: Math.round(new Date().getTime() / 1000),
  };
};
