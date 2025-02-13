const requestJsonRpc2 = require('request-json-rpc2').default;
const { SERVER } = require('../environments/index.cjs');

const ORIGIN_RPC = SERVER.HOST + '/rpc';

module.exports.notifyCalendar = async ({ uid, ics, user, language }) => {
  const { result, error } = await requestJsonRpc2({
    url: ORIGIN_RPC,
    body: {
      id: uid,
      method: 'notify',
      params: [ics],
    },
    headers: {
      'Authorization': user.jwt,
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
    url: ORIGIN_RPC,
    body: {
      id: uid,
      method: 'generate-calendar',
      params: activity,
    },
    headers: {
      'Authorization': user.jwt,
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
