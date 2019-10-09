const Abstract = require('.');
const {
  uploadAppleHealthData,
} = require('../../services/apple-health.service');
const { readOFX } = require('../../services/tinkoff.service');
const kppService = require('../../services/kpp.service');

class AbstractDocument extends Abstract {
  get context() {
    return {
      ...super.context,
    };
  }

  async precommit() {
    // todo: ofx|pdf|json|xml|AppleHealth(export.xml)
    switch (this.mime) {
      // todo: парсинг
      case 'xxx_ofx': {
        // const ofxResult = await readOFX(buffer);
        // ofxResult.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM
        break;
      }
      case 'xxx_applehealth': {
        // 'apple_health_export/export.xml'
        // const healthObject = await uploadAppleHealthData(zipBuffer);
        break;
      }
      default: {
        break;
      }
    }
  }

  async commit() {

  }
}

module.exports = AbstractDocument;
