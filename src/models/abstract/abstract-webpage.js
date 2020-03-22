const package_ = require('../../../package.json');
const Abstract = require('../abstract/index');
const ogParser = require('../../module/og-parser');

class AbstractWebpage extends Abstract {
  constructor({
                url,
              }) {
    super();
    this.url = url;
  }

  get context() {
    return {
      ...super.context,
      '@context': 'http://schema.org',
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
    this.title = title;
  }
}

module.exports = AbstractWebpage;
