const ac = require('../app/middlewares/rbac');
/**
 * Фильтруем выдачу в зависимост от доступа RBAC
 *
 * @param {jsonld} data - jsonld
 * @param {boolean} isOwner - isOwner
 * @param {*} role - role
 * @returns {object}
 */
const filter = (data, isOwner, role) => {
  let permission;
  if (isOwner) {
    permission = ac.can(role).readOwn('message');
  } else {
    permission = ac.can(role).readAny('message');
  }
  if (!permission.granted) {
    throw new Error('forbidden');
  }
  return permission.filter(data);
};

module.exports = {
  filter,
};
