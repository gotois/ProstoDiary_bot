const Abstract = require('.');
const jsonldAction = require('../action/base');

class AbstractCommand extends Abstract {
  /**
   * @param {object} data - data
   * @param {object} [context] - context
   */
  constructor(data, context) {
    super(data);
    this.command = data.command;
    this._context = context || {};
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'AllocateAction',
      'name': this.command,
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
      ...this._context,
    };
  }
}

module.exports = AbstractCommand;
