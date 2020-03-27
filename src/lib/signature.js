const linkedDataSignature = require('../services/linked-data-signature.service');

module.exports.signature = async function(document) {
  const signedMessage = await linkedDataSignature.signDocument(
    document,
    this.public_key_cert.toString('utf8'),
    this.private_key_cert.toString('utf8'),
    this.passport_id,
  );
  return signedMessage;
};

// todo verify

// todo validify
