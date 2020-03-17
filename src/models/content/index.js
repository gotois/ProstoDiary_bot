class Content {
  constructor({
    content,
    contentType,
    emailMessageId,
    schema,
    tags = [],
  }) {
    this.content = Buffer.from(content); // rename raw
    this.contentType = contentType;
    this.emailMessageId = emailMessageId;
    this.abstracts = [];
    this.schema = schema;
    this.tags = tags;
  }
}

module.exports = Content;
