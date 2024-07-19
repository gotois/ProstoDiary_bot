module.exports.sendPrepareAction = function sendPrepareAction(accept) {
  if (accept.startsWith('text/')) {
    return 'typing';
  } else if (accept.startsWith('audio/')) {
    return 'record_audio';
  }
  return 'upload_document';
};
