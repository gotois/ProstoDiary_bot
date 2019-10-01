const sgMail = require('@sendgrid/mail');
const { SENDGRID } = require('../../src/environment');

sgMail.setApiKey(SENDGRID.API_KEY);

module.exports = sgMail;
