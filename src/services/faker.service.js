class Device {
  /**
   * fake device_id
   *
   * @type {string}
   * @returns {string}
   */
  get DEVICE_ID() {
    return 'curl';
  }
  /**
   * face device_os
   *
   * @type {string}
   * @returns {string}
   */
  get DEVICE_OS() {
    return 'linux';
  }
}

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
  Device,
  FakerText,
  FakerPassport,
};
