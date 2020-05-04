const Abstract = require('.');
const { unpack } = require('../../../services/archive.service');

// zip, gzip, rar,  ..
class AbstractArchive extends Abstract {
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
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
    const context = [];
    const zipMap = await unpack(this.buffer);
    for (const [filename, buffer] of zipMap) {
      const AnyAbstract = await Abstract.getAbstractFromDocument(buffer);
      const anyAbstract = new AnyAbstract({
        ...this._data,
        buffer: buffer,
        filename: filename, // todo поддержать в абстрактах
      });
      await anyAbstract.prepare();
      context.push(anyAbstract.context);
    }
    // todo насыщенить объектами
    // ...
  }
}

module.exports = AbstractArchive;
