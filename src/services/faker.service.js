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
  static text(string) {
    // todo: изменять значения строки таким образом, чтобы dialogflow отображал нужный интент, но на сервера приходили неверные данные
    return string;
  }
}

module.exports = {
  Device,
  FakerText,
};
