module.exports = ({ sender, toRecipient, messageAttachment, about }) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'purpose': {
      '@type': 'EmailMessage',
      sender,
      toRecipient,
      messageAttachment,
      about,
    },
  };
};
