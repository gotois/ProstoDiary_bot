class Content {
  constructor ({
                 content,
    contentType,
    emailMessageId,
    telegramMessageId,
               }) {
    this.content = Buffer.from(content); // rename raw
    this.contentType = contentType;
    this.emailMessageId = emailMessageId;
    this.telegramMessageId = telegramMessageId;
    this.abstracts = [];
  }
}

module.exports = Content;
