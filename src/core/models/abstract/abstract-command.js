const Abstract = require('.');

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
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        name: 'schema:name',
        startTime: 'schema:startTime',
        subjectOf: 'schema:subjectOf',
        object: 'schema:object',
        abstract: 'schema:abstract',
        encodingFormat: 'schema:encodingFormat',
        identifier: 'schema:identifier',
        provider: 'schema:provider',
        participant: 'schema:participant',
        value: 'schema:value',
        email: 'schema:email',
        mainEntity: 'schema:mainEntity',
      },
      '@type': 'AllocateAction',
      'name': this.command,
      'object': {
        '@type': 'CreativeWork',
        'name': 'command',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
      ...this._context,
    };
  }
}

module.exports = AbstractCommand;
