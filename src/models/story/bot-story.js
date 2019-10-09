const Story = require('.');

class BotStory extends Story {
  constructor(abstract) {
    super(abstract);
  }
  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}

module.exports = BotStory;
