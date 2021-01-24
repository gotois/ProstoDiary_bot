/**
 * @returns {string}
 */
module.exports = () => {
  let html = '';
  html += `
    <h1>Your Virtual Assistant</h1>
    <div><a href="/registration">Registration</a></div>
    <div><a href="/marketplace">Marketplace</a></div>
  `;
  return html;
};
