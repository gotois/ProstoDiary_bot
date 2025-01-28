const requestJsonRpc2 = require('request-json-rpc2').default;
const { SERVER_HOST } = require('../environments/index.cjs');

module.exports.notifyCalendar = async ({ id, activity, jwt, language }) => {
  const { result, error } = await requestJsonRpc2({
    url: SERVER_HOST + '/rpc',
    body: {
      id: id,
      method: 'add-calendar',
      params: activity,
    },
    jwt: jwt,
    headers: {
      'Accept': 'text/markdown',
      'Accept-Language': language,
    },
  });
  if (error) {
    throw error;
  }
  return result;
};

module.exports.sentToSecretary = async function ({ id, activity, jwt, language }) {
  const { result, error } = await requestJsonRpc2({
    url: SERVER_HOST + '/rpc',
    body: {
      id: id,
      method: 'generate-calendar',
      params: activity,
    },
    jwt: jwt,
    headers: {
      'Accept': 'text/markdown',
      'Accept-Language': language,
    },
  });
  if (error) {
    throw error;
  }
  return result;
};
