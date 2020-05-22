const Abstract = require('.');
const voiceAnalyze = require('../analyze/voice-analyze');
const jsonldAction = require('../action/base');

class AbstractVoice extends Abstract {
  /**
   * @param {object} data - data
   * @param {*} data.buffer - data
   * @param {*} data.mimeType - data
   * @param {*} data.fileSize - data
   * @param {*} data.duration - data
   * @param {*} data.uid - data
   */
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
    this.mimeType = data.mimeType;
    this.fileSize = data.fileSize;
    this.duration = data.duration;
    this.uid = data.uid;
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'AllocateAction',
      'name': 'Voice',
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.buffer.toString('base64'),
        'encodingFormat': this.mimeType,
      },
      'object': [
        {
          '@type': 'CreativeWork',
          'text': this.text,
        },
      ],
    };
  }

  async prepare() {
    await voiceAnalyze(this);
  }
}

module.exports = AbstractVoice;
