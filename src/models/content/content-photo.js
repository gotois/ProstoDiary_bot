const Abstract = require('../abstract/index');
// const { getPhotoDetection } = require('../../services/photo.service');

class ContentPhoto extends Abstract {
  #caption;
  
  get context() {
    return {
      ...super.context,
    }
  }

  async precommit () {
    // todo проверка на QR будет выполняться в ассистенте
    // const { isQR } = await getPhotoDetection({
    //   caption: this.#caption,
    //   fileBuffer: this.buffer,
    // });
  }
  
  async commit() {

  }
}

module.exports = ContentPhoto;
