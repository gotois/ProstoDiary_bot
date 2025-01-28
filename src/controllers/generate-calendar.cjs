const requestJsonRpc2 = require('request-json-rpc2').default;
const { SERVER_HOST } = require('../environments/index.cjs');

// Добавление события в открываемой ссылке на Google Calendar
module.exports.formatGoogleCalendarUrl = function ({ eventName, eventDescription, dtStart, dtEnd, location }) {
  const link = new URL('https://calendar.google.com/calendar/render');
  link.searchParams.append('action', 'TEMPLATE');
  link.searchParams.append('text', eventName);
  link.searchParams.append('details', eventDescription);
  if (dtEnd) {
    link.searchParams.append('dates', dtStart + '/' + dtEnd);
  } else {
    link.searchParams.append('dates', dtStart + '/' + dtStart);
  }
  if (location) {
    link.searchParams.append('location', location);
  }
  return link;
};

module.exports.generateCalendar = async ({ id, activity, jwt, language }) => {
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
