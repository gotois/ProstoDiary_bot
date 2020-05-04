const parser = require('fast-xml-parser');
const Abstract = require('.');

// преобразование html, xml в json
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
  // eslint-disable-next-line
  async prepare() {
    const parserOptions = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false,
    };
    const string = this.buffer.toString();
    if (!parser.validate(string)) {
      throw new TypeError('Its not XML');
    }
    this.json = parser.parse(string, parserOptions, false);
    // todo в зависимости от свойств файла (например, ClinicalDocument, HTML) присваивать уникальный тип элементу
    // ...
  }
}

module.exports = AbstractDsl;
