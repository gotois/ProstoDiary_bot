const package_ = require('../../../../package.json');
const Abstract = require('.');

class AbstractCommand extends Abstract {
  /**
   * @param {object} data - data
   */
  constructor(data) {
    super(data);
    this.command = data.command;
  }

  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        name: 'schema:name',
      },
      '@type': 'AllocateAction',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
      },
      'name': this.command,
    };
  }
}

module.exports = AbstractCommand;
