module.exports.executeAtTime = (targetTime, cb) => {
    const currentTime = new Date().getTime();
    const targetDate = targetTime.getTime();
    const timeDifference = targetDate - currentTime;

    if (timeDifference > 0) {
      setTimeout(() => {
        cb();
      }, timeDifference);
    } else {
      console.warn("Целевое время уже прошло.");
      cb()
    }
}
