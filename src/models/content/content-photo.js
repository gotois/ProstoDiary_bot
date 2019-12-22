const Content = require('./index');

class ContentPhoto extends Content {
  #caption;

  constructor(data) {
    super(data);
  }

  async prepare () {
    // todo добавлять после детектирования необходимые абстракты (QR, Face, etc)
  }
}

module.exports = ContentPhoto;
