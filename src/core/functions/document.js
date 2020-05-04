const FileType = require('file-type');
const { unpack } = require('../../../services/archive.service');
const AbstractPDF = require('../models/abstract/abstract-pdf');
const AbstractDSL = require('../models/abstract/abstract-dsl');
const AbstractOFX = require('../models/abstract/abstract-ofx');
/**
 * @param {buffer} buffer - buffer
 * @param {string} filename - filename
 * @returns {Promise<AbstractOfx|AbstractDsl|AbstractPDF>}
 */
const getAbstractFromDocument = async (buffer, filename) => {
  const { mime } = await FileType.fromBuffer(buffer);
  switch (mime) {
    case 'application/octet-stream': {
      const mapBuffer = await unpack(buffer);
      if (mapBuffer.size === 0) {
        throw new Error('Empty file');
      }
      // eslint-disable-next-line
      mapBuffer.forEach((buffer) => {
        // todo нужен рекурсивных обход документов
      });
      break;
    }
    case 'application/xml': {
      // hack но пока не пойму как лучше детектировать ofx
      if (filename.endsWith('.ofx')) {
        return AbstractOFX;
      } else {
        return AbstractDSL;
      }
    }
    case 'application/pdf': {
      return AbstractPDF;
    }
    default: {
      throw new Error('Unknown document mimetype: ' + mime);
    }
  }
};
/**
 * @description работа с документами
 * @param {*} parameters - object
 * @returns {Promise<jsonldApiRequest|Error>}
 */
module.exports = async function (parameters) {
  const AnyAbstract = await getAbstractFromDocument(
    parameters.buffer,
    parameters.filename,
  );
  const anyAbstract = new AnyAbstract(parameters);
  await anyAbstract.prepare();
  return anyAbstract.context;
};
