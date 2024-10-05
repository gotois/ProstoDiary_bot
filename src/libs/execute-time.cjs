const ICAL = require('ical.js');

function executeAtTime(targetTime, callback) {
  const currentTime = Date.now();
  const targetDate = targetTime.getTime();
  const timeDifference = targetDate - currentTime;

  if (timeDifference > 0) {
    setTimeout(() => {
      callback();
    }, timeDifference);
  } else {
    console.warn('Целевое время уже прошло.');
    callback();
  }
}

module.exports.notify = (ical) => {
  return new Promise((resolve) => {
    const icalData = ICAL.parse(ical);
    const comp = new ICAL.Component(icalData);
    const vevent = comp.getFirstSubcomponent('vevent');
    const dtstart = vevent.getFirstPropertyValue('dtstart').toString().replace('Z', '');

    executeAtTime(new Date(dtstart), () => {
      const out = {}
      let task = 'Внимание\\! У вас есть задача:\n';
      const summary = vevent.getFirstPropertyValue('summary');
      if (summary) {
        task += vevent.getFirstPropertyValue('summary') + '\n';
      }
      out.text = task;
      const url = vevent.getFirstPropertyValue('url');
      if (URL.parse(url)) {
        out.url = url;
      }
      // const dateString = new Intl.DateTimeFormat('ru').format(
      //   new Date(dtstart),
      // );
      // task += dateString + '\n';
      resolve(out);
    });
  });
};
