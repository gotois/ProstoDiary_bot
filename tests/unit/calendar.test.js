const { formatCalendarMessage } = require('../../src/controllers/generate-calendar.cjs');

/**
 * @param {object} t - test
 */
module.exports = (t) => {
  const ical =
    // eslint-disable-next-line max-len
    'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:c67ad630-4feb-4bee-84d0-8c69bed131bd\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nBEGIN:VEVENT\r\nUID:91d69cdd-130d-4ac8-b8ef-30261f6a6c85\r\nDTSTAMP:20240709T125532Z\r\nDTSTART:20240710T200000Z\r\nDTEND:20240710T205959Z\r\nSUMMARY:Запланировать поход завтра вечером\r\nDESCRIPTION:Посетить новое место или встретиться с друзьями\r\nSTATUS:CONFIRMED\r\nCATEGORIES:развлечения\r\nORGANIZER:Инкогнито\r\nEND:VEVENT\r\nEND:VCALENDAR';
  const outputMessage = formatCalendarMessage(ical);
  t.true(outputMessage.includes('20:00'));
  t.pass();
};
