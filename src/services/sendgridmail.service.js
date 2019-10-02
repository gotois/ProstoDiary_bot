const sgMail = require('@sendgrid/mail');
const logger = require('./logger.service');
const { SENDGRID, IS_AVA_OR_CI } = require('../../src/environment');

if (IS_AVA_OR_CI) {
  logger.log('warn', 'SendGrid is not working in AVA or CI');
} else {
  sgMail.setApiKey(SENDGRID.API_KEY);
}

module.exports = sgMail;
