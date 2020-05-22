const parser = require('fast-xml-parser');
const Abstract = require('.');
const ofxAnalyze = require('../analyze/ofx-analyze');
const healthAnalyze = require('../analyze/health-analyze');
const clinicalAnalyze = require('../analyze/clinical-analyze');
const jsonldAction = require('../action/base');

// преобразование html, xml в json
class AbstractDsl extends Abstract {
  constructor(parameters) {
    super(parameters);
    this.buffer = parameters.buffer;
    this.parserOptions = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false,
    };
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
    };
  }
  // eslint-disable-next-line
  async prepare() {
    const string = this.buffer.toString();
    if (!parser.validate(string)) {
      throw new TypeError('Its not XML');
    }
    this.json = parser.parse(string, this.parserOptions, false);

    // в зависимости от свойств файла (например, ClinicalDocument, HTML) присваиваем уникальные типы
    // AppleHealth
    // eslint-disable-next-line no-prototype-builtins
    if (this.json.hasOwnProperty('HealthData')) {
      healthAnalyze(this);
    }
    // eslint-disable-next-line no-prototype-builtins
    if (this.json.hasOwnProperty('ClinicalDocument:')) {
      clinicalAnalyze(this);
    }

    // OFX
    // eslint-disable-next-line no-prototype-builtins
    if (this.json.hasOwnProperty('OFX')) {
      ofxAnalyze(this);
    }
  }
}

module.exports = AbstractDsl;
