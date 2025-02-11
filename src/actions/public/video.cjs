module.exports = (bot, message, dialog) => {
  dialog.push(message);

  console.log('video, activity', dialog.activity);
};
