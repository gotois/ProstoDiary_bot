const parser = require('fast-xml-parser');
const Abstract = require('.');

// AppleHealth - схема для выгрузки
const clinicalDocumentReader = (json) => {
  const objects = [];
  // todo дополнить схемой
  json.ClinicalDocument.recordTarget.patientRole;

  return objects;
};

const healthData = (json) => {
  const objects = [];

  // todo странные данные - возможно дополнить в схему
  // json.HealthData.Me;

  json.HealthData.ClinicalRecord.map((record) => {
    return {
      '@type': 'MedicalEntity',
      'name': record.type,
      'identifier': record.identifier,
      'description': record.sourceName,
      'url': record.sourceURL,
      // fhirVersion: '1.0.2',
      // receivedDate: '2018-12-18 14:06:24 -0600',
    };
  }).forEach((record) => {
    objects.push(record);
  });
  return objects;
};

// OFX - схема для выгрузки из банковских счетов
const ofxReader = (json) => {
  const { BANKTRANLIST } = json.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
  const objects = BANKTRANLIST.STMTTRN.map((stmttrn) => {
    return {
      '@type': 'FinancialProduct',
      'name': stmttrn.NAME,
      // broker
      'amount': {
        '@type': stmttrn.TRNTYPE,
        'currency': stmttrn.CURRENCY,
        // todo добавить
        // stmttrn.DTPOSTED,
        // stmttrn.TRNAMT,
        // stmttrn.FITID,
        // stmttrn.MEMO,
      },
    };
  });
  return objects;
};

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
   * @returns {jsonldApiRequest}
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
      const healthObjects = healthData(this.json);
      this.object.concat(healthObjects);
    }
    // eslint-disable-next-line no-prototype-builtins
    if (this.json.hasOwnProperty('ClinicalDocument:')) {
      const clinicalObjects = clinicalDocumentReader(this.json);
      this.object.concat(clinicalObjects);
    }

    // OFX
    // eslint-disable-next-line no-prototype-builtins
    if (this.json.hasOwnProperty('OFX')) {
      const financeObjects = ofxReader(this.json);
      this.object.concat(financeObjects);
    }
  }
}

module.exports = AbstractDsl;
