const languageService = require('../../services/nlp.service');
const Abstract = require('./index');

class AbstractText extends Abstract {
  constructor(data) {
    super(data);
    this.language = languageService.langISO(data.language);
    this.text = data.text;
  }

  get context() {
    return {
      ...super.context,
      text: this.text,
      language: this.language,
    };
  }
}

module.exports = AbstractText;
