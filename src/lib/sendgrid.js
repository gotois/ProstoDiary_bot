const sgMail = require('@sendgrid/mail');
const { SENDGRID, IS_PRODUCTION } = require('../environment');

if (IS_PRODUCTION) {
  sgMail.setApiKey(SENDGRID.API_KEY);
} else {
  sgMail.setApiKey(SENDGRID.API_KEY_DEV);
}

module.exports.mail = sgMail;
