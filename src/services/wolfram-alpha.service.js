const WolframAlphaAPI = require('wolfram-alpha-api');
const { WOLFRAM_ALPHA } = require('../env');
const waApi = WolframAlphaAPI(WOLFRAM_ALPHA.APP_ID);

module.exports = waApi;
