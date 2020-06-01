class FakerText {
  /**
   * @todo заменять перед запросами конфиденциальную информацию фейками, не теряя контекста
   * @param {string} text - text string
   * @returns {string}
   */
  static text(text) {
    // todo: изменять значения строки таким образом, чтобы dialogflow отображал нужный интент, но на сервера приходили неверные данные
    return text;
  }
}

class FakerPassport {
  /**
   * fake passport
   *
   * @type {string}
   * @returns {string}
   */
  static get passport() {
    return {
      activated: true,
      user: 'ava-test',
      passportId: '-1',
      assistant: 'e2e@gotointeractive.com',
      email: 'e2e@gotointeractive.com',
      jwt: 'YOUR_VALID_JWT',
    };
  }
}

module.exports = {
  FakerText,
  FakerPassport,
};
