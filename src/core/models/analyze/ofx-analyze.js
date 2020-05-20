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

module.exports = (abstract) => {
  const financeObjects = ofxReader(abstract.json);
  abstract.object.concat(financeObjects);
};
