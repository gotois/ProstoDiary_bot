const parser = require('fast-xml-parser');
const Abstract = require('../abstract/index');
const { unpack } = require('../../services/archive.service');

// html, xml, json и пр
class ContentDsl extends Abstract {
  get context() {
    return {
      ...super.context,
    };
  }

  async precommit() {
    const mapBuffer = await unpack(buffer);
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
      const jsonObject = parser.parse(string, parserOptions);
    });
  }

  async commit() {
    await this.precommit();
  }
}

module.exports = ContentDsl;
