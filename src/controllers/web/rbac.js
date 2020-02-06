// todo это убрать из core и поместить куда-то ближе к controllers/web/rbac.js ???
const AccessControl = require('accesscontrol');

const ac = new AccessControl();
ac.grant('demo');
ac.grant('bot').readOwn('message');
ac.grant('user').extend('bot');

module.exports = ac;
