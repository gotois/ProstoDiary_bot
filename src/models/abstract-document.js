const Abstract = require('./abstract');
const {
  uploadAppleHealthData,
} = require('../services/apple-health.service');
const { readOFX } = require('../services/tinkoff.service');
const kppService = require('../services/kpp.service');

// todo: ofx|pdf|json|xml|AppleHealth(export.xml)
class AbstractDocument extends Abstract {
  #document = null;
  
  async fill () {
    // todo: парсинг ofx
    // const ofxResult = await readOFX(buffer);
    // ofxResult.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM
    
    // 'apple_health_export/export.xml'
    // const healthObject = await uploadAppleHealthData(zipBuffer);
  }
}

module.exports = AbstractDocument;
