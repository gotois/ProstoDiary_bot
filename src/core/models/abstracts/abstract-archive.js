const Abstract = require('.');
const { unpack } = require('../../../services/archive.service');

// zip, gzip, rar,  ..
class AbstractArchive extends Abstract {
  constructor(data) {
    super(data);
  }

  get context() {
    return {
      ...super.context,
    };
  }

  async prepare() {
    // eslint-disable-next-line
    for await (const [_fileName, buffer] of unpack(content)) {
      // buffer.toString()
      // todo в зависимости от буффера создавать абстракты
    }
  }
}

module.exports = AbstractArchive;
