// todo это не должно быть в контроллере, перенести в более подходящую директорию
const AccessControl = require('accesscontrol');

const ac = new AccessControl();
ac.grant('demo');
ac.grant('bot').readOwn('message');
ac.grant('user').extend('bot');

module.exports = ac;
