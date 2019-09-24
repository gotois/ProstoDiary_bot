class Abstract {
  #intent = []; // Определяем намерения
  /**
   * @type {Buffer}
   */
  buffer = null;
  
  constructor(content) {
    this.buffer = content;
  }
  
  get intent() {
    if (this.#intent.length) {
      return this.#intent[0].replace('Intent', '').toLowerCase();
    }
    return null;
  }
  set intent(intentName) {
    this.#intent.unshift(intentName);
  }
}

module.exports = Abstract;
