const { execSync } = require('child_process');
const { DATABASE } = require('../../environment');
const logger = require('../../services/logger.service');
const Content = require('./index');

// todo: это абстракция необходима только для бота - она оборачивает все внутренние запросы на его обновление
//  боту не нужны сложные правила разбора естественного языка, он вполне может обойтись любым компьютерным языком.
//  таким образом можно передавать не просто историю в StoryJSON, а некие запросы на выполнение этой истории (js, python, php, etc)
class ContentScript extends Content {
  #cmd = [];
  async precommit() {
    switch (this.mime) {
      case 'application/sql': {
        this.#cmd.push(`psql --dbname ${DATABASE.name} --host ${DATABASE.host} --username ${DATABASE.user} --port ${DATABASE.port} --no-password --command "${this.raw.toString()}"`);
        break;
      }
      // todo: python, js, etc
      // case 'plain/text': {
      //   this.#cmd.push(`${this.raw.toString()}`);
      //   break;
      // }
      default: {
        throw new TypeError('mime type ' + this.mime);
      }
    }
  }
  async commit() {
    await super.commit();

    // todo выполнение cmd будет выполняться в ассистенте
    for (const stdin of this.#cmd) {
      const stdout = execSync(stdin);
      logger.log('info', stdout.toString());
    }
  }
}

module.exports = ContentScript;
