module.exports.executeAtTime = (targetTime, callback) => {
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
};
