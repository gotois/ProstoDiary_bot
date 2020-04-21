const parser = require('fast-xml-parser');
const Abstract = require('.');
const { unpack } = require('../../../services/archive.service');

// html, xml, json и пр
class AbstractDsl extends Abstract {
  constructor(parameters) {
    super(parameters);
    this.buffer = parameters.buffer;
  }
  /**
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      ...super.context,
    };
  }

  async prepare() {
    const mapBuffer = await unpack(this.buffer);
    if (mapBuffer.size === 0) {
      throw new Error('Empty file');
    }
    const parserOptions = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: false,
      trimValues: true,
      parseTrueNumberOnly: false,
    };
    mapBuffer.forEach((buffer) => {
      const string = buffer.toString('utf8');
      // eslint-disable-next-line
      const jsonObject = parser.parse(string, parserOptions);
    });
  }
}

module.exports = AbstractDsl;
