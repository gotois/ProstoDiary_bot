const Content = require('./index');
// const { getPhotoDetection } = require('../../services/photo.service');

class ContentPhoto extends Content {
  #caption;

  constructor(data) {
    super(data);
  }

  async prepare () {
    // todo детектировать через vision
    // @see https://github.com/gotois/ProstoDiary_bot/issues/310
    // ...
    // todo проверка на QR будет выполняться в ассистенте
    // const { isQR } = await getPhotoDetection({
    //   caption: this.#caption,
    //   fileBuffer: this.buffer,
    // });
    // todo добавлять после детектирования необходимые абстракты (QR, Face, etc)
  }
}

module.exports = ContentPhoto;
