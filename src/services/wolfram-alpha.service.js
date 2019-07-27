const WolframAlphaAPI = require('wolfram-alpha-api');
const { WOLFRAM_ALPHA } = require('../environment');
const waApi = WolframAlphaAPI(WOLFRAM_ALPHA.APP_ID);

module.exports = waApi;
