class Content {
  constructor({
    content,
    contentType,
    emailMessageId,
    telegramMessageId,
    schema,
    tags = [],
  }) {
    this.content = Buffer.from(content); // rename raw
    this.contentType = contentType;
    this.emailMessageId = emailMessageId;
    this.telegramMessageId = telegramMessageId;
    this.abstracts = [];
    this.schema = schema;
    this.tags = tags;
  }
}

module.exports = Content;
