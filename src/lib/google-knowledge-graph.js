const { get } = require('./request');
const { GOOGLE } = require('../environment');

const GKG_HOST = 'kgsearch.googleapis.com';
/**
 * @param {string} query - query
 * @returns {Promise<string|Buffer|Error>}
 */
const query = async (query) => {
  const result = await get(
    `https://${GKG_HOST}/v1/entities:search`,
    {
      query: encodeURIComponent(query),
      key: GOOGLE.GOOGLE_KNOWLEDGE_GRAPH,
      limit: 1,
      indent: 'True',
    },
    undefined,
    'utf8',
  );
  return result;
};

module.exports = {
  query,
};
