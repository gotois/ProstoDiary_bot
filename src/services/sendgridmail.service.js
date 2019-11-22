const sgMail = require('@sendgrid/mail');
const { SENDGRID } = require('../environment');
const { patch } = require('../services/request.service');

sgMail.setApiKey(SENDGRID.API_KEY);

const HOST = 'api.sendgrid.com';

// update Event Webhook settings
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
