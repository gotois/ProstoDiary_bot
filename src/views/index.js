const { SERVER } = require('../environment');

module.exports = () => {
  return `
      <a href="${SERVER.HOST}/oidc/auth?client_id=tg&response_type=code&scope=openid%20email%20email%20profile">Telegram Assistant</a>
  `;
};
