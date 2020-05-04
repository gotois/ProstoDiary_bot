const AbstractDsl = require('./abstract-dsl');

class AbstractOfx extends AbstractDsl {
  constructor(parameters) {
    super(parameters);
  }
  /**
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      ...super.context,
    };
  }

  async prepare() {
    await super.prepare();
    const { BANKTRANLIST } = this.json.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
    BANKTRANLIST.STMTTRN.forEach((stmttrn) => {
      this.object.push({
        '@type': 'Thing',
        'name': stmttrn.NAME,
        'amount': {
          '@type': stmttrn.TRNTYPE,
          'currency': stmttrn.CURRENCY,
          // todo добавить
          // stmttrn.DTPOSTED,
          // stmttrn.TRNAMT,
          // stmttrn.FITID,
          // stmttrn.MEMO,
        },
      });
    });
  }
}

module.exports = AbstractOfx;
