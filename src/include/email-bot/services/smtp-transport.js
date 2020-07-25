const nodemailer = require('nodemailer');
const environment = require('../environment.json');

const transporter = nodemailer.createTransport(environment.smtp);

module.exports = transporter;
