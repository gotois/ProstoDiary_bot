const { execSync } = require('child_process');
const Abstract = require('.');

// todo: это абстракция необходима только для бота - она оборачивает все внутренние запросы на его обновление
//  боту не нужны сложные правила разбора естественного языка, он вполне может обойтись любым компьютерным языком.
//  таким образом можно передавать не просто историю в StoryJSON, а некие запросы на выполнение этой истории (js, python, php, etc)
class AbstractScript extends Abstract {
  async precommit() {
    switch (this.mime) {
      case 'application/sql': {
        this.cmd = `psql -U postgres -d postgres -a "${buffer.toString()}"`;
        break;
      }
      case 'plain/text': {
        console.log('plain text script');
        break;
      }
      default: {
        return jsonrpc.JsonRpcError.invalidRequest('mime type ' + this.mime);
      }
    }
  }
  async commit() {
    const stdout = execSync(this.cmd);
    console.log('xxx', stdout.toString())
  }
}

module.exports = AbstractScript;
