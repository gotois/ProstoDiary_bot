const { publisher } = require('../../../package.json');
const Story = require('./');

class BotStory extends Story {
  constructor(params) {
    super(params);
  }
  get publisher() {
    return publisher;
  }
  // todo: это правовое поле действий бота
  get jurisdiction() {
    return [
      {
        "coding": [
          {
            "system": "urn:iso:std:iso:3166",
            "code": "GB",
            // "display": "United Kingdom of Great Britain and Northern Ireland (the)"
          }
        ]
      }
    ];
  }
}

module.exports = BotStory;
