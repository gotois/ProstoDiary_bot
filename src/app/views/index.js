/**
 * @returns {string}
 */
module.exports = () => {
  let html = '';
  html += `
    <h1>Your Virtual Assistant</h1>
    <div><a href="/registration">Registration</a></div>
    <div><a href="/marketplace">Marketplace</a></div>
    <div><a href="/oidc/.well-known/openid-configuration">OpenId Configuration</a></div>
  `;
  return html;
};
