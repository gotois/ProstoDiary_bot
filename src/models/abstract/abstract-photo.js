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
    // const { isQR } = await getPhotoDetection({
    //   caption: this.#caption,
    //   fileBuffer: this.buffer,
    // });
  }
  
  async commit() {

  }
}

module.exports = AbstractPhoto;
