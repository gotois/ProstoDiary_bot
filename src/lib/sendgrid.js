const sgMail = require('@sendgrid/mail');
const { SENDGRID, IS_PRODUCTION } = require('../environment');
const { patch } = require('../services/request.service');

if (IS_PRODUCTION) {
  sgMail.setApiKey(SENDGRID.API_KEY);
} else {
  sgMail.setApiKey(SENDGRID.API_KEY_DEV);
}
/**
 * @constant
 * @type {string}
 */
const HOST = 'api.sendgrid.com';
/**
 * @description sendgrid update Event Webhook settings
 * @param {string} url - url
 * @returns {Promise<void>}
 */
const updateWebhook = async (url) => {
  await patch(
    `https://${HOST}/v3/user/webhooks/event/settings`,
    JSON.stringify({
      enabled: true,
      url: url + '/mail',
      delivered: true,
      processed: true,
    }),
    {
      'Authorization': 'Bearer ' + SENDGRID.API_KEY,
      'Content-Type': 'application/json',
    },
  );
};

module.exports.updateWebhook = updateWebhook;
module.exports.mail = sgMail;
