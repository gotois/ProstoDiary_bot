const Abstract = require('./abstract');
const {
  uploadAppleHealthData,
} = require('../../services/apple-health.service');

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
