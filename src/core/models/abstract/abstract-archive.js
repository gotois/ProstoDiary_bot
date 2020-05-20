const Abstract = require('.');
const archiveAnalyze = require('../analyze/archive-analyze');

// zip, gzip, rar,  ..
class AbstractArchive extends Abstract {
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
    this._objectContext = [];
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'Action',
      'object': this._objectContext,
    };
  }

  async prepare() {
    await archiveAnalyze(this);
  }
}

module.exports = AbstractArchive;
