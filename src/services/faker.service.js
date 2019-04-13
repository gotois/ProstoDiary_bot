class Device {
  /**
   * fake device_id
   *
   * @type {string}
   */
  get DEVICE_ID() {
    return 'curl';
  }
  /**
   * face device_os
   *
   * @type {string}
   */
  get DEVICE_OS() {
    return 'linux';
  }
}

module.exports = {
  Device,
};
