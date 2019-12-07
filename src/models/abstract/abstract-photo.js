const Abstract = require('./abstract');
// const { getPhotoDetection } = require('../../services/photo.service');

class AbstractPhoto extends Abstract {
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

module.exports = AbstractPhoto;
