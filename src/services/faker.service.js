class FakerPassport {
  /**
   * fake assistant
   *
   * @returns {object}
   */
  static get assistants() {
    return {
      private_key:
        // eslint-disable-next-line max-len
        'MsWMTGEWHMkuLKSYS1LtoWNsDbuEf9yBCCJmTsauVDqiipt6BuMcYukGfqQnLn8dwp8TLyGSMiDJ9ex7uUsooww',
      public_key: 'FyKBU7QGaF6hXb26tNKVm1YoJT2QBDoTbXUTCFx2xzVY',
      id: '-1',
      token: '-1',
      clientId: 'ava@gotointeractive.com',
      name: 'ava',
    };
  }
  /**
   * fake passport
   *
   * @returns {object}
   */
  static get passport() {
    return {
      activated: true,
      user: 'ava-test',
      passportId: '-1',
      email: 'e2e@gotointeractive.com',
    };
  }
}

module.exports = {
  FakerPassport,
};
