const Abstract = require('.');
const { unpack } = require('../../../services/archive.service');

// zip, gzip, rar,  ..
class AbstractArchive extends Abstract {
  constructor(data) {
    super(data);
  }
  /**
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      ...super.context,
      // todo ...
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
