const { v1: uuidv1 } = require('uuid');
const requestJsonRpc2 = require('request-json-rpc2').default;
const { SERVER } = require('../environments/index.cjs');

const ORIGIN_RPC = SERVER.HOST + '/rpc';

/**
 * @description Добавление события в открываемой ссылке на Google Calendar
 * @param {object} o - object
 * @param {string} o.text - text
 * @param {string} [o.details] - details
 * @param {string} o.start - start
 * @param {string} [o.end] - end
 * @param {string} [o.location] - location
 * @returns {module:url.URL}
 */
function formatGoogleCalendarUrl({ text, details, start, end, location }) {
  const link = new URL('https://calendar.google.com/calendar/render');
  link.searchParams.append('action', 'TEMPLATE');
  link.searchParams.append('text', text);
  link.searchParams.append('details', details);
  if (end) {
    link.searchParams.append('dates', start + '/' + end);
  } else {
    link.searchParams.append('dates', start + '/' + start);
  }
  if (location) {
    link.searchParams.append('location', location);
  }
  return link;
}

module.exports.notifyCalendar = async ({ ics, user }) => {
  const { result, error } = await requestJsonRpc2({
    url: ORIGIN_RPC,
    body: {
      id: uuidv1(),
      method: 'notify',
      params: [ics],
    },
    headers: {
      'Authorization': user.jwt,
      'Accept': 'text/markdown',
      'Accept-Language': user.language,
      'Geolocation': user.location,
    },
  });
  if (error) {
    throw error;
  }
  return result;
};
