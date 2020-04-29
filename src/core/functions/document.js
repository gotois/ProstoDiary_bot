const AbstractPDF = require('../models/abstract/abstract-pdf');
/**
 * @description работа с документами
 * @param {*} parameters - object
 * @returns {Promise<jsonldApiRequest|Error>}
 */
module.exports = async function (parameters) {
  switch (parameters.mimeType) {
    case 'application/pdf': {
      const abstractPdf = new AbstractPDF(parameters);
      await abstractPdf.prepare();
      return abstractPdf.context;
    }
    default: {
      throw new Error('Unknown document mimetype: ' + parameters.mimeType);
    }
  }
};
