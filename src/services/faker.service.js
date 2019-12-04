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
   * @returns {*}
   */
  static text(text) {
    // todo: изменять значения строки таким образом, чтобы dialogflow отображал нужный интент, но на сервера приходили неверные данные
    return text;
  }
}

module.exports = {
  Device,
  FakerText,
};
