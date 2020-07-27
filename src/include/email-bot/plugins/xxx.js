// const transporter = require('../services/smtp-transport');
const { readMailStream } = require('../helpers/mail');

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
  });

  next();
};
