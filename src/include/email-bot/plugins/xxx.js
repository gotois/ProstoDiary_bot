/* eslint-disable */
const transporter = require('../services/smtp-transport');
const { readMailStream, mailObject } = require('../helpers/mail');
const package_ = require('../package.json');

exports.register = function () {
  this.loginfo('Initializing !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! plugin');

  // this.register_hook('queue', 'queue');
  this.register_hook('mail', 'mail');
};

exports.hook_data = function (next /*, connection */) {
  next();
};

exports.mail = function (next, connection /*, params */) {
  connection.transaction.uuid;
  connection.transaction.mail_from;
  connection.transaction.rcpt_to;
  connection.transaction.message_stream;
  // connection.transaction.notes;
  connection.relaying = true;
  connection.transaction.parse_body = true;

  readMailStream(connection.transaction.message_stream).then((mail) => {
    this.loginfo('!!!!! TEXT: ' + mail.text);
    this.loginfo('!!!!! HTML: ' + mail.html);
    this.loginfo('!!!!! Date: ' + mail.date);
    this.loginfo('!!!!! Subject: ' + mail.subject);

    // todo эти данные надо обработать core/text
    //  и прислать в ответ обратное письмо что письмо получено и обработано

    // try {
    //   if (!mailResult.complete) {
    //     throw new Error('Mail send not completed');
    //   }
    //   return '📨';
    // } catch (error) {
    //   logger.error(error.response.body.errors);
    //   throw new Error('Email bad request');
    // }

    this.loginfo('----');
    const message = mailObject({
      personalizations: [
        {
          to: 'test@gmail.com',
          // to: "35dcb6f5a49f40a89ecc6f6a478f62@gotointeractive.com",
          headers: {
            'x-bot': package_.name,
            'x-bot-version': package_.version,
          },
          subject: 'Hi',
        },
      ],
      from: '"Mani Itseme" <support@gotointeractive.com>',
      // replyTo: { // fixme
      //   email: 'bugs@gotointeractive.com',
      //   name: 'Bug gotois',
      // },

      // todo лучше использовать единый формат вида
      //  content: [
      //   {
      //     type: mime,
      //     value: content,
      //   },
      // ],
      text: 'It\'s me., how are you Man?',
      html: '<i>It\'s me, how are you Man?</i>',
      // amp: '...',

      attachments: [
        //
        // {
        //   "content": "base64 attachment content",
        //   "type": "application/xxx",
        //   "name": "invite.xxx",
        //   "filename": "invite.xxx",
        //   "disposition": "attachment"
        // },
      ],
    });

    // console.log(message)

    transporter.sendMail(message).then((info) => {
      this.loginfo('Message sent: %s', info.messageId);
    }).catch(error => {
      this.loginfo(error.toString());
      this.loginfo('!!!!!!! WWWWWWWW');
    });
  });

  next();
};
