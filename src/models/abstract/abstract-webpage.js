const package_ = require('../../../package.json');
const Abstract = require('../abstract/index');
const ogParser = require('../../module/og-parser');

class AbstractWebpage extends Abstract {
  constructor(data) {
    super(data);
    this.url = data.url;
  }

  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        encodingFormat: 'schema:encodingFormat',
        url: 'schema:url',
        name: 'schema:name',
        alternativeHeadline: 'schema:alternativeHeadline',
      },
      '@type': 'WebContent',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
        'url': package_.homepage,
      },
      'encodingFormat': 'text/html',
      'alternativeHeadline': this.title,
      'url': this.url,
    };
  }

  async prepare() {
    const { title } = await ogParser(this.url);
    this.title = encodeURIComponent(title);
  }
}

module.exports = AbstractWebpage;
