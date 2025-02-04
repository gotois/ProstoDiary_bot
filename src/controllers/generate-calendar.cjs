const requestJsonRpc2 = require('request-json-rpc2').default;
const { SERVER_HOST } = require('../environments/index.cjs');

module.exports.notifyCalendar = async ({ uid, ics, user, language }) => {
  const { result, error } = await requestJsonRpc2({
    url: SERVER_HOST + '/rpc',
    body: {
      id: uid,
      method: 'notify',
      params: [ics],
    },
    jwt: user.jwt,
    headers: {
      'Accept': 'text/markdown',
      'Accept-Language': language,
      'Geolocation': user.location,
    },
  });
  if (error) {
    throw error;
  }
  return result;
};

module.exports.generateCalendar = async function ({ uid, activity, user, language }) {
  const { result, error } = await requestJsonRpc2({
    url: SERVER_HOST + '/rpc',
    body: {
      id: uid,
      method: 'generate-calendar',
      params: activity,
    },
    jwt: user.jwt,
    headers: {
      'Accept': 'text/markdown',
      'Accept-Language': language,
      'Geolocation': user.location,
    },
  });
  if (error) {
    throw error;
  }
  return result;
};
