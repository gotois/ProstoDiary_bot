const { unpack } = require('../../services/archive.service');
const Content = require('.');

// zip, gzip, rar,  ..
class ContentArchive extends Content {
  constructor(data) {
    super(data);
  }

  async prepare() {
    for await (const [_fileName, buffer] of unpack(content)) {
      // buffer.toString()
      // todo в зависимости от буффера создавать абстракты
    }
  }
}

module.exports = ContentArchive;
