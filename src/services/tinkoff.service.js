const parser = require('fast-xml-parser');
/**
 * @param {Buffer} buffer - buffer XML
 * @returns {object}
 */
const readOFX = (buffer) => {
  let string = '';
  if (Buffer.isBuffer(buffer)) {
    string = buffer.toString('utf8');
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

  const jsonObject = parser.parse(string, parserOptions);

  const { BANKTRANLIST } = jsonObject.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
  BANKTRANLIST.STMTTRN.forEach((stmttrn) => {
    // TODO: эти данные нужно сохранять в History
    stmttrn.TRNTYPE;
    stmttrn.DTPOSTED;
    stmttrn.TRNAMT;
    stmttrn.FITID;
    stmttrn.NAME;
    stmttrn.MEMO;
    stmttrn.CURRENCY;
  });
  return jsonObject.OFX;
};

module.exports = {
  readOFX,
};
