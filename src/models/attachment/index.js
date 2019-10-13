const fileType = require('file-type');
const openpgp = require('openpgp');
const { unpack } = require('../../services/archive.service');
const logger = require('../../services/logger.service');
const AbstractText = require('../abstract/abstract-text');
const AbstractPhoto = require('../abstract/abstract-photo');
const AbstractDocument = require('../abstract/abstract-document');

class Attachment {
  /**
   * @param {Buffer} buffer - buffer
   * @param {string|undefined} type - mime type
   * @returns {{disposition: string, filename: string, content_id: string, type: string, content: string}}
   */
  static async create(buffer, type) {
    if (Buffer.byteLength(buffer) === 0) {
      throw new Error('Empty buffer');
    }
    let filename = 'attachment';
    const content_id = 'attachmentid';
    if (type === 'plain/text') {
      filename += '.txt';
    } else {
      const fType = fileType(buffer);
      if (fType) {
        type = fType.mime;
        filename += '.' + fType.ext;
      }
    }
    const encrypted = await openpgp.encrypt({
      message: openpgp.message.fromBinary(buffer),
      passwords: ['secret stuff'],
      // compression: openpgp.enums.compression.zip // todo: добавить затем компрессию
    });
    return {
      content: Buffer.from(encrypted.data).toString('base64'),
      filename,
      type,
      disposition: 'attachment',
      content_id,
    };
  }
  /**
   * @param {Mail} mail - mail
   * @returns {Promise<Array<Abstract>>}
   */
  static async read({ attachments, date }) {
    const abstracts = [];
    for (const attachment of attachments) {
      const {
        content,
        contentType,
        transferEncoding,
        // generatedFileName,
        // contentId,
        // checksum,
        // length,
        // contentDisposition,
        // fileName,
      } = attachment;
      if (transferEncoding !== 'base64') {
        continue;
      }
      switch (contentType) {
        case 'plain/text': {
          abstracts.push(new AbstractText(content, contentType, date));
          break;
        }
        case 'image/png':
        case 'image/jpeg': {
          abstracts.push(new AbstractPhoto(content, contentType, date));
          break;
        }
        case 'application/pdf':
        case 'application/xml': {
          abstracts.push(new AbstractDocument(content, contentType, date));
          break;
        }
        case 'application/zip':
        case 'multipart/x-zip': {
          for await (const [_fileName, zipBuffer] of unpack(content)) {
            abstracts.push(new AbstractDocument(zipBuffer, contentType, date));
          }
          break;
        }
        case 'application/octet-stream': {
          abstracts.push(new AbstractText(content, contentType, date));
          break;
        }
        default: {
          // todo: тогда нужен разбора html и text самостоятельно из письма
          logger.log('info', 'Unknown mime type ' + contentType);
        }
      }
    }
    return abstracts;
  }
}

module.exports = Attachment;
