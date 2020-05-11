const Abstract = require('.');
const { unpack } = require('../../../services/archive.service');

// zip, gzip, rar,  ..
class AbstractArchive extends Abstract {
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
    this._objectContext = [];
  }
  /**
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'Action',
      'object': this._objectContext,
    };
  }

  async prepare() {
    const zipMap = await unpack(this.buffer);
    for (const [filename, buffer] of zipMap) {
      const DynamicAbstract = await Abstract.getAbstractFromDocument(buffer);
      const anyAbstract = new DynamicAbstract({
        ...this._data,
        buffer: buffer,
        filename,
      });
      await anyAbstract.prepare();
      this._objectContext.push(anyAbstract.context);
    }
  }
}

module.exports = AbstractArchive;
