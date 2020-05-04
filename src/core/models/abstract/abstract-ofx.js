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
      // TODO: эти данные нужно сохранять в History
      stmttrn.TRNTYPE;
      stmttrn.DTPOSTED;
      stmttrn.TRNAMT;
      stmttrn.FITID;
      stmttrn.NAME;
      stmttrn.MEMO;
      stmttrn.CURRENCY;
    });
  }
}

module.exports = AbstractOfx;
